import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Entry point of the /create wizard — redirects to the first real step
// so both /create and /create/details work as expected.
export default function Create() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/create/details', { replace: true }) }, [navigate])
  return null
}
