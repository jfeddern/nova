import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
      destructive: 'bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
      outline: 'border-2 border-input bg-background hover:bg-accent hover:border-primary/50 hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70 shadow-sm',
      ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
    }

    const sizeStyles = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 rounded-lg px-3.5 text-xs',
      lg: 'h-12 rounded-xl px-8 text-base',
      icon: 'h-11 w-11',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
