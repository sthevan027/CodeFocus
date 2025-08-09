import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    />
  )
}