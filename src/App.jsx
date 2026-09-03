import AppRouter from './router/AppRouter.jsx'
import ToastViewport from './components/common/Toast.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-bg font-sans text-dark antialiased">
      <AppRouter />
      <ToastViewport />
    </div>
  )
}
