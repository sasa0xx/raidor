import React from 'react'
import { cn } from '../lib/utils'

interface InputProps extends React.ComponentPropsWithoutRef<'input'> { }

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-md border transition-all duration-150 outline-none',
        'bg-slate-100 text-slate-900 border-slate-200 placeholder:text-slate-400',
        'dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800 dark:placeholder:text-gray-500',
        'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:focus:border-violet-500',
        className
      )}
    />
  )
}
