import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: Props) {
  return (
    <button
      {...props}
      className={clsx(
        'rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50',
        {
          'bg-blue-500 text-white hover:bg-blue-400': variant === 'primary',
          'bg-slate-100 text-slate-800 hover:bg-slate-200': variant === 'secondary',
          'text-slate-600 hover:text-slate-800': variant === 'ghost',
          'py-2 px-4 text-sm': size === 'sm',
          'py-3 px-5 text-base': size === 'md',
          'py-4 px-6 text-lg': size === 'lg',
        },
        className
      )}
    >
      {children}
    </button>
  )
}
