import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass'
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-dark-800 border-dark-600',
      glass: 'glass-dark',
    }

    const Component = hover ? motion.div : 'div'
    const hoverProps = hover
      ? {
          whileHover: { scale: 1.02, y: -4 },
          transition: { type: 'spring', stiffness: 300 },
        }
      : {}

    return (
      <Component
        ref={ref}
        className={cn(
          'rounded-xl p-6 border shadow-lg',
          variants[variant],
          className
        )}
        {...hoverProps}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'