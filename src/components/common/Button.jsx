const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-600 shadow-sm hover:shadow-md focus:ring-primary-200',
  accent: 'bg-accent text-dark hover:bg-accent-600 shadow-sm hover:shadow-md focus:ring-accent-200',
  dark: 'bg-dark text-white hover:bg-black shadow-sm hover:shadow-md focus:ring-dark/20',
  outline: 'bg-transparent text-dark border border-dark/15 hover:border-dark/30 hover:bg-dark/5 focus:ring-dark/10',
  ghost: 'bg-transparent text-dark hover:bg-dark/5 focus:ring-dark/10',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm focus:ring-red-200'
}

const SIZES = {
  sm: 'text-sm px-3.5 py-2 rounded-lg gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-7 py-3.5 rounded-xl gap-2.5'
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-4
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
        active:scale-[0.98]
        ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : icon ? (
        <span className="inline-flex shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  )
}
