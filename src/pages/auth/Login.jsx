import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', company: '', jobTitle: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (mode === 'signup' && !form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (form.password.length < 6) errs.password = 'Minimum 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signup(form)
        toast.success('Account created — welcome to Bkard')
      } else {
        await login(form)
        toast.success('Welcome back')
      }
      navigate('/auth/gst-verification')
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/onboarding/exclusivity" className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary text-lg font-black text-white">B</Link>
          <h1 className="text-2xl font-extrabold text-dark">{mode === 'login' ? 'Sign in to Bkard' : 'Create your account'}</h1>
          <p className="mt-1 text-sm text-dark/50">{mode === 'login' ? 'Access your executive identity' : 'Build your premium digital card'}</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-dark/5 bg-white p-6 shadow-card">
          {mode === 'signup' && (
            <Input label="Full name" placeholder="Jordan Blake" value={form.fullName} onChange={update('fullName')} error={errors.fullName} />
          )}
          <Input label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} error={errors.email} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={update('password')} error={errors.password} />
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Company" placeholder="Acme Inc." value={form.company} onChange={update('company')} />
              <Input label="Job title" placeholder="CEO" value={form.jobTitle} onChange={update('jobTitle')} />
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-dark/50">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-semibold text-primary hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
