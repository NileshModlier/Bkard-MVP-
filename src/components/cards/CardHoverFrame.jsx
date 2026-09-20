export default function CardHoverFrame({ children, className = '' }) {
  return (
    <div
      className={`
        origin-center transition-transform duration-200 ease-out will-change-transform
        hover:-translate-y-1
        motion-reduce:transform-none motion-reduce:hover:translate-y-0
        ${className}
      `}
    >
      {children}
    </div>
  )
}
