import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Button from './components/button';
import Input from './components/input';
import Autocomplete from './components/autocomplete';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
// import ToggleSwitch from './components/toggle';
import moment from 'moment-timezone';
const ct = require("countries-and-timezones");

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FybG9zYWx2YXJlejkxIiwiYSI6ImNqOTdjNHVoNDBkZWkzM3FxdXh2YjgydDAifQ.HSeYyxtpV4OvyvGO5DeA-g';

const loadData = async () => {
  try {
    const response = await fetch('https://timezone-converter-c658d.web.app/combined.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

type Timezone = {
  name: string
  utcOffset: number
}

const TimezoneMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [inputHours, setInputHours] = useState<number | undefined>(undefined);
  const [inputMinutes, setInputMinutes] = useState<number | undefined>(undefined);
  const [inputTZ, setInputTZ] = useState<string>();
  const [outputTZ, setOutputTZ] = useState<string>();
  const clickCount = useRef<number>(0)
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string>();
  const [combined, setCombined] = useState<GeoJSON.FeatureCollection | null>(null);
  const [progress, setProgress] = useState(0); // For loading bar progress

  const allTimezones: Timezone[] = Object.values(ct.getAllTimezones());

  useEffect(() => {
    // TODO: Do not load geojson data in mobile
    let intervalId: any;
    const fetchData = async () => {
      intervalId = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90)); // Increment progress up to 90%
      }, 200); // Update progress every 200ms

      const data = await loadData();
      setCombined(data); // Set fetched data
      setProgress(100); // Set progress to 100% once fetch completes
      clearInterval(intervalId); // Stop the interval
    };

    fetchData();

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);


  useEffect(() => {
    // TODO: Do not load map in mobile
    if (combined) {
      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [0, 0],
        zoom: 2,
      });
  
      mapRef.current = map;
  
      // Load timezone GeoJSON
      map.on('load', () => {
  
        map.addSource('timezones', {
          type: 'geojson',
          data: combined as GeoJSON.FeatureCollection, //timezones as GeoJSON.FeatureCollection,
          generateId: true, 
        });
  
        // Listen for the 'data' event to detect when the source is loaded
        map.on('data', (event:any) => {
          if (event.sourceId === 'timezones' && event.isSourceLoaded) {
            console.log('Timezones source loaded!');
            setLoading(false);
          }
        });
  
  
        // Add the timezone layer
        map.addLayer({
          id: 'timezones-layer',
          type: 'fill',
          source: 'timezones',
          paint: {
            'fill-color': '#088', // Default color (teal)
            'fill-opacity': 0.1,
          },
        });
  
        // Handle click on timezone layer
        map.on('click', 'timezones-layer', (e) => {
          console.log('Click on timezones layer:', e, e.features);
          if (!e.features || e.features.length === 0) return;
          const clickedFeature = e.features[0];  
          const timezone = clickedFeature.properties?.tzid || 'Unknown Timezone';
          console.log(`Clicked Timezone: ${timezone}`);
          handleMapClick(clickedFeature)
        });
  
        // Add cursor pointer on hover
        map.on('mouseenter', 'timezones-layer', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'timezones-layer', () => {
          map.getCanvas().style.cursor = '';
        });
      });  
      return () => map.remove();
    }
  }, [combined]);

  const handleMapClick = (clickedFeature: Feature<Geometry, GeoJsonProperties>) => {

    const tz = clickedFeature.properties?.tzid

    const utcOffset = ct.getTimezone(tz).utcOffset

    const tzsWithSameUtcOffset = allTimezones.filter(e=>e?.utcOffset === utcOffset).map(e=>e?.name)
    const features = combined?.features?.filter(e=>tzsWithSameUtcOffset.includes(e.properties?.tzid))

    
    clickCount.current += 1;
    if (clickCount.current === 1) {
      cleanupLayers('highlighted-timezone-input')
      cleanupLayers('highlighted-timezone-output')
            cleanupLayers('highlighted-timezone-input')

              // Add a new source for the highlighted feature
              mapRef.current?.addSource('highlighted-timezone-input', {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: features || [], // Only the clicked feature
                },
              });

              // Add a new layer for the highlighted feature
              mapRef.current?.addLayer({
                id: 'highlighted-timezone-input',
                type: 'fill',
                source: 'highlighted-timezone-input',
                paint: {
                  'fill-color': '#d2361e', // Highlight color (red)
                  'fill-opacity': 0.7,  // Higher opacity for highlight
                },
              });

              setInputTZ(tz)
              
    } else if (clickCount.current === 2) {
                cleanupLayers('highlighted-timezone-output')
                    // Add a new source for the highlighted feature
                    mapRef.current?.addSource('highlighted-timezone-output', {
                      type: 'geojson',
                      data: {
                        type: 'FeatureCollection',
                        features: features || [], // Only the clicked feature
                      },
                    });
                    // Add a new layer for the highlighted feature
                    mapRef.current?.addLayer({
                      id: 'highlighted-timezone-output',
                      type: 'fill',
                      source: 'highlighted-timezone-output',
                      paint: {
                        'fill-color': '#00489a', // Highlight color (red)
                        'fill-opacity': 0.7,  // Higher opacity for highlight
                      },
                    });

                    setOutputTZ(tz)
                    clickCount.current = 0;
    }

  };

  function changeHours(e: React.ChangeEvent<HTMLInputElement>){

    const value = Number(e.target.value);
    setInputHours(value)
  }
  function changeMinutes(e: React.ChangeEvent<HTMLInputElement>){

    const value = Number(e.target.value);
    setInputMinutes(value)
  }

  function setCurrentTime() {
    const currentTime = new Date()
    const h = currentTime.getHours()
    const m = currentTime.getMinutes()
    setInputHours(h)
    setInputMinutes(m)
  }

  const cleanupLayers = (id: string) => {
    if (mapRef.current?.getLayer(id)) {
      mapRef.current.removeLayer(id);
    }

    // Check if the source exists and remove it
    if (mapRef.current?.getSource(id)) {
      mapRef.current.removeSource(id);
    }
  }

  async function setCurrentTimezone(id: string) {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      if (data?.timezone) {
        const tz = data.timezone
        if (id==='input'){
          setInputTZ(tz)
        }else {
          setOutputTZ(tz)
        }

        const utcOffset = ct.getTimezone(tz).utcOffset
        const tzsWithSameUtcOffset = allTimezones.filter(e=>e?.utcOffset === utcOffset).map(e=>e?.name)
        const features = combined?.features?.filter(e=>tzsWithSameUtcOffset.includes(e.properties?.tzid))


        const layerId = `highlighted-timezone-${id}`
        cleanupLayers(layerId)
        if (features) {
          mapRef.current?.addSource(layerId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: features, // Only the clicked feature
            },
          });
  
          //  Add a new layer for the highlighted feature
          mapRef.current?.addLayer({
            id: layerId,
            type: 'fill',
            source: layerId,
            paint: {
              "fill-color": id === 'input' ? "#d2361e" :"#00489a",
              'fill-opacity': 0.4,  // Higher opacity for highlight
            },
          });
        }
      }
    } catch (error: any) {
      console.error("Error fetching IP-based timezone:", error.message);
    }
  }

    type Country = {
      name: string, 
      timezones: string[]
    }

    const allCountries: Country[] = Object.values(ct.getAllCountries())
    // Create a flat list of countries with their timezones
    const countryOptions = allCountries.map(country => ({
      label: country?.name,
      timezones: country?.timezones,
    }));
  
    // Flatten the data to include timezones as options within their respective countries
    const flattenedOptions = countryOptions.reduce((acc: any[], country) => {
      country.timezones.forEach((timezone: string) => {
        acc.push({
          label: `${country.label} - ${timezone}`,
          country: country.label,
          timezone: timezone,
          value: timezone,
        });
      });
      return acc;
    }, []);


    const convertTZ = () => {

        // Validate the input
        if (!inputTZ || !outputTZ) {
          console.error("Please select both input and output timezones.");
          return;
        }
    
        console.log("Converting from:", inputTZ, "to:", outputTZ, "at hour:", inputHours , ':', inputMinutes);
    
    
        const currentDateTime = moment();

        const paddedHours = String(inputHours).padStart(2, "0");
        const paddedMinutes = String(inputMinutes).padStart(2, "0");

        const inputTime = moment.tz(currentDateTime.format(`YYYY-MM-DD ${paddedHours}:${paddedMinutes}`), inputTZ);
    
        // Convert to the output timezone
        const outputTime = inputTime.clone().tz(outputTZ);
        const formattedOutputHour = outputTime.format("HH:mm z"); // e.g.,15:00:00 IST

        setResult(formattedOutputHour)
  
    }

  return <>
          <div className={`relative flex flex-col items-center justify-center h-full w-full sm:h-[400px] sm:w-96 sm:fixed sm:bottom-3 sm:left-3 p-2.5 bg-white z-10 rounded-md rounded-base border-2 border-border dark:border-darkBorder  font-base shadow-light dark:shadow-dark`}>
            <div className="flex flex-col items-start gap-2">
              <p className="text-center w-full font-bold mb-4 text-slate-700">Timezone converter</p>
              <div className="flex flex-col">
                <label htmlFor="hours" className="text-sm font-medium text-gray-700">
                  Time to convert
                </label>
              <div className="flex flex-row items-end gap-1">
                  <Input
                  value={inputHours}
                  type="number"
                  min={0}
                  max={24}
                  placeholder="12"
                  className="w-14 h-10"
                  onChange={changeHours}
                />
                <Input
                value={inputMinutes}
                type="number"
                min={0}
                max={60}
                placeholder="00"
                className="w-14 h-10"
                onChange={changeMinutes}
              />

                <Button
                className="h-10 bg-blue-50 hover:bg-blue-100 text-xs text-black py-2 px-4 rounded"
                onClick={()=>setCurrentTime()}
                >
                  Use current time
              </Button>

              {/* TODO:  <ToggleSwitch isToggled={true} setIsToggled={()=>console.log('...')} /> */}

              </div>
            </div>
              <div className="flex flex-row gap-1 items-end mb-4">
                <div className='flex flex-col'>
                  <label htmlFor="input" className="text-sm font-medium text-gray-700">
                    Input timezone
                  </label>
                  <Autocomplete
                    defaultValue={flattenedOptions.find(e=>e.timezone === inputTZ)?.label}
                    options={flattenedOptions}
                    onOptionClick={(e)=>{
                      const tz = e.value;
                      setInputTZ(tz)

                      if (combined) {

                      const utcOffset = ct.getTimezone(tz).utcOffset
                      const tzsWithSameUtcOffset = allTimezones.filter(e=>e?.utcOffset === utcOffset).map(e=>e?.name)
                      const features = combined?.features?.filter(e=>tzsWithSameUtcOffset.includes(e.properties?.tzid))
                             

                        cleanupLayers('highlighted-timezone-input');

                        if (features) {

                          mapRef.current?.addSource('highlighted-timezone-input', {
                            type: 'geojson',
                            data: {
                              type: 'FeatureCollection',
                              features: features, // Only the clicked feature
                            },
                          });
  
                          mapRef.current?.addLayer({
                            id: 'highlighted-timezone-input',
                            type: 'fill',
                            source: 'highlighted-timezone-input',
                            paint: {
                              'fill-color': '#d2361e', // Highlight color (red)
                              'fill-opacity': 0.4,  // Higher opacity for highlight
                            },
                          });
                        }

                      }

                    }}
                    className='h-10'
                    />
                </div>
                <Button
                  className="h-10 bg-blue-50 hover:bg-blue-100 text-xs text-black py-2 px-4 rounded"
                  onClick={()=>setCurrentTimezone('input')}
                  >
                  Use current TZ
                </Button>
              </div>
              <div className="flex gap-1 items-end">
                  <div className='flex flex-col'>
                    <label htmlFor="output" className="text-sm font-medium text-gray-700">
                      Output timezone
                    </label>
                      <Autocomplete
                        defaultValue={flattenedOptions.find(e=>e.timezone === outputTZ)?.label}
                        options={flattenedOptions}
                        onOptionClick={(e)=>{
                          const tz = e.value;
                          setOutputTZ(tz)

                          if (combined) {
                            const utcOffset = ct.getTimezone(tz).utcOffset
                            const tzsWithSameUtcOffset = allTimezones.filter(e=>e?.utcOffset === utcOffset).map(e=>e?.name)
                            const features = combined?.features?.filter(e=>tzsWithSameUtcOffset.includes(e.properties?.tzid))
                
                            cleanupLayers('highlighted-timezone-output')
                            if (features) {

                              mapRef.current?.addSource('highlighted-timezone-output', {
                                type: 'geojson',
                                data: {
                                  type: 'FeatureCollection',
                                  features: features, // Only the clicked feature
                                },
                              });
  
                              mapRef.current?.addLayer({
                                id: 'highlighted-timezone-output',
                                type: 'fill',
                                source: 'highlighted-timezone-output',
                                paint: {
                                  'fill-color': '#00489a', // Highlight color (red)
                                  'fill-opacity': 0.4,  // Higher opacity for highlight
                                },
                              });
                            }

                          }
                        }}
                        className='h-10'
                        />
                  </div>
                  <Button
                  className="h-10 bg-blue-50 hover:bg-blue-100 text-xs text-black py-2 px-4 rounded"
                  onClick={()=>setCurrentTimezone('output')}
                  >
                  Use current TZ
                </Button>
              </div>
              <div className='w-full flex justify-start gap-10 items-center'>
                <Button onClick={()=>convertTZ()}>
                  Convert
                </Button>
                <span className='font-bold'>Result: {result}</span>
              </div>
            </div>
            <span className="absolute bottom-3 left-3 text-xs">Made by <a rel="noreferrer" className="underline text-blue-500" href="http://carlosalvarez.surge.sh" target="_blank">Carlos</a> with 🫶 </span>
          </div>
          {loading  && <div className='fixed opacity-80 bg-yellow-50 w-full h-full flex flex-col items-center justify-center'> 
               <span>Loading timezones ... </span>
                <div
              style={{
                height: '10px',
                width: '300px',
                backgroundColor: '#ddd',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: '#4caf50',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>}
          <div className="hidden sm:block" id="map" ref={mapContainer} style={{ width: '100%', height: '100vh'}} />
          </>;
};

export default TimezoneMap;
