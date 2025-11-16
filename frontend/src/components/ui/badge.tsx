import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'border-transparent bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:scale-105',
    secondary: 'border-transparent bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:scale-105',
    destructive:
      'border-transparent bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover:scale-105',
    outline: 'border-2 border-border text-foreground bg-background hover:bg-accent',
    success: 'border-transparent bg-success text-white shadow-sm hover:shadow-md hover:scale-105',
    warning: 'border-transparent bg-warning text-white shadow-sm hover:shadow-md hover:scale-105',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
