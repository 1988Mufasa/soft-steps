import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  columns?: 2 | 3 | 4
}

export function ChoiceGrid({ children, columns = 2 }: Props) {
  return (
    <div className={`choice-grid cols-${columns}`} role="group">
      {children}
    </div>
  )
}
