import { cn } from '@/lib/utils'

type IconColor = 'green' | 'yellow' | 'blue' | 'teal' | 'orange' | 'purple'

interface IconCircleProps {
  icon: React.ComponentType<{ className?: string }>
  color: IconColor
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorMap: Record<IconColor, string> = {
  green: 'bg-icon-green',
  yellow: 'bg-icon-yellow',
  blue: 'bg-icon-blue',
  teal: 'bg-icon-teal',
  orange: 'bg-icon-orange',
  purple: 'bg-icon-purple',
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const iconSizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function IconCircle({ icon: Icon, color, size = 'md', className }: IconCircleProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        sizeMap[size],
        colorMap[color],
        className
      )}
    >
      <Icon className={cn('text-white', iconSizeMap[size])} />
    </div>
  )
}
