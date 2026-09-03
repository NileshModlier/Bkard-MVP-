import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, icon, className = '', containerClassName = '', textarea = false, ...rest },
  ref
) {
  const Field = textarea ? 'textarea' : 'input'
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-dark/80">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dark/40">
            {icon}
          </span>
        )}
        <Field
          ref={ref}
          className={`
            w-full rounded-xl border bg-white px-4 py-3 text-sm text-dark
            placeholder:text-dark/35
            transition-all duration-150
            focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary
            ${error ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : 'border-dark/10'}
            ${icon ? 'pl-10' : ''}
            ${textarea ? 'min-h-[110px] resize-y' : ''}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-dark/45">{hint}</p>}
    </div>
  )
})

export default Input
