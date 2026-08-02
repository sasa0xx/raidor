import React from 'react'
import { cn } from '../lib/utils'

interface InputProps extends React.ComponentPropsWithoutRef<'input'> { }

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn('w-full px-3 py-2 text-gray-100 placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500', className)}
    />
  )
}
