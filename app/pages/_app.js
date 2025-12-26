import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'
import { TimerProvider } from '../context/TimerContext'
import { ToastProvider } from '../components/Toast'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <TimerProvider>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </TimerProvider>
    </AuthProvider>
  )
}

export default MyApp

