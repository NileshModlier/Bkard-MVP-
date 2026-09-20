export default function Card({ children, className = '', hover = false, padding = 'p-6', ...rest }) {
  return (
    <div
      className={`
        rounded-2xl border border-dark/10 bg-white shadow-card dark:bg-surface
        ${hover ? 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${padding} ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  )
}
