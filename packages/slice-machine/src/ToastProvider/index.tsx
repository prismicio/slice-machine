import React from 'react'
import { ToastProvider } from 'react-toast-notifications'

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider
      autoDismiss
      autoDismissTimeout={6000}
      // components={{ Toast: (props) => {
      //   console.log({ props })
      //   return <div />
      // } }}
      placement="bottom-right"
    >
      { children }
    </ToastProvider>
  )
}

export default Provider
