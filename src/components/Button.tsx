import React from 'react'

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  varient?: 'primary' | 'secondary' | 'ghost';
  children?: React.ReactNode;
}

export function Button({ className, varient: variant, children, ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50';
  let variantStyles = '';

  if (variant === "ghost") {
    variantStyles = 'border text-violet-500 border-violet-500 hover:text-gray-200 hover:bg-gray-800 focus:ring-gray-500';
  }
  else if (variant === 'secondary') {
    variantStyles = 'bg-amber-500 text-gray-950 hover:bg-amber-400 active:bg-amber-600 focus:ring-amber-500';
  } else {
    variantStyles = 'bg-violet-600 text-white hover:bg-violet-500 active:bg-violet-700 focus:ring-violet-500';
  }

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles} ${className || ''}`}
    >
      {children}
    </button >
  )
}
