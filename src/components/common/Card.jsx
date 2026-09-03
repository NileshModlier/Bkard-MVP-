export default function Card({ children, className = '', hover = false, padding = 'p-6', ...rest }) {
  return (
    <div
      className={`
        rounded-2xl border border-dark/5 bg-white shadow-card
        ${hover ? 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${padding} ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  )
}
