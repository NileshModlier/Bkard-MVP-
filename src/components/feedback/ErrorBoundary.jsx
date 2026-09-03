// NEW component — the review (§13, Architecture Authentication section)
// flagged that no error boundary existed anywhere in the app. A revoked or
// expired Supabase session mid-render, or any unexpected render error,
// would previously white-screen the app with no recovery path. Class
// component is required here — React error boundaries have no hook
// equivalent as of React 18.
import { Component } from 'react'
import Button from '../common/Button.jsx'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Swap for a real monitoring call (e.g. Sentry.captureException) once
    // observability is wired in — see architecture review §20.
    console.error('[Bkard] Uncaught render error', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
        <p className="text-lg font-bold text-dark">Something went wrong</p>
        <p className="max-w-sm text-sm text-dark/50">
          Bkard hit an unexpected error. Reloading usually fixes it — if it keeps happening, please
          let us know.
        </p>
        <Button onClick={this.handleReload}>Reload Bkard</Button>
      </div>
    )
  }
}
