import { ToastProvider } from 'react-toast-notifications'

const Provider = ({ children }) => {
  return (
    <ToastProvider
      autoDismiss
      autoDismissTimeout={6000}
      // components={{ Toast: Snack }}
      placement="bottom-right"
    >
      { children }
    </ToastProvider>
  )
}

export default Provider
