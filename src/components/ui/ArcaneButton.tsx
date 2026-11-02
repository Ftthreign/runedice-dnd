'use client'

import * as React from 'react'
import { motion, type HTMLMotionProps } from 'motion/react'
import { cn } from '../../lib/utils'
import { springs } from '../../lib/motion-tokens'

export interface ArcaneButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export const ArcaneButton = React.forwardRef<HTMLButtonElement, ArcaneButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-mono font-bold tracking-wider uppercase transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a2a78] focus-visible:ring-offset-2 focus-visible:ring-offset-[#200033] disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-md min-h-[36px]',
      md: 'px-5 py-2.5 text-sm rounded-lg min-h-[44px]',
      lg: 'px-8 py-3.5 text-base rounded-xl min-h-[52px]',
    }

    const variantStyles = {
      primary:
        'bg-[#eee3b0] text-[#200033] border border-[#eee3b0] hover:bg-[#fff5c7] hover:shadow-[0_0_20px_rgba(238,227,176,0.5)] active:bg-[#ded196]',
      secondary:
        'bg-[#500071] text-[#fff8e8] border border-[#70418a] hover:border-[#8a2a78] hover:bg-[#63008d] hover:shadow-[0_0_16px_rgba(138,42,120,0.45)]',
      ghost:
        'bg-transparent text-[#c7b5d1] hover:text-[#fff8e8] hover:bg-[#35104a]/60 border border-transparent hover:border-[#70418a]/40',
      danger:
        'bg-[#8e1934] text-[#fff8e8] border border-[#ff5a7e] hover:bg-[#a61c3c] hover:shadow-[0_0_18px_rgba(142,25,52,0.5)]',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={springs.snappy}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

ArcaneButton.displayName = 'ArcaneButton'
export default ArcaneButton
