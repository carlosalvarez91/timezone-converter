import { ClassValue } from 'clsx'
import { cn } from '../utils'

type Props = {
  className?: ClassValue
  value?: string | number
  placeholder: string,
  type: string,
  min?: number,
  max?: number,
  onChange: (e:any)=> void;
}

export default function Input({
  className,
  value,
  placeholder,
  type,
  min,
  max,
  onChange,
}: Props) {
  return (
    <input
      className={cn(
        'rounded-base bg-white border-2 border-border dark:border-darkBorder  p-[10px] font-base ring-offset-white focus-visible:outline-none  outline-none',
        className,
      )}
      type={type}
      name="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-label={placeholder}
      min={min}
      max={max}
    />
  )
}