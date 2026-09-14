import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  return (
    <div
      className={[
        'bg-white rounded-2xl border border-gray-100 shadow-sm',
        hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : '',
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'blue' | 'yellow' | 'red' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

const badgeVariants = {
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
}

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'sm',
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-semibold',
        badgeVariants[variant],
        badgeSizes[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
