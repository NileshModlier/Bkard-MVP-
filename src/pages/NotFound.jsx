import { Link } from 'react-router-dom'
import Button from '../components/common/Button.jsx'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
      <p className="text-6xl font-black text-dark/10">404</p>
      <p className="text-lg font-bold text-dark">Page not found</p>
      <p className="text-sm text-dark/50">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard"><Button className="mt-2">Back to dashboard</Button></Link>
    </div>
  )
}
