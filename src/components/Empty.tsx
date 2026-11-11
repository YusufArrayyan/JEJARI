import type { ReactNode } from 'react'

export function Empty({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="t-h3">{title}</h3>
      {children && <p className="t-body">{children}</p>}
      {action}
    </div>
  )
}
