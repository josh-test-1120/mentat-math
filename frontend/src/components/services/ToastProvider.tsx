'use client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        newestOnTop 
        closeOnClick 
        pauseOnHover
        limit={3}
        stacked={true}
        hideProgressBar={false}
        draggable={true}
        draggablePercent={60}
        rtl={false}
        pauseOnFocusLoss={true}
        enableMultiContainer={false}
        className="toast-container"
        toastClassName="toast-item"
        bodyClassName="toast-body"
        progressClassName="toast-progress"
      />
    </>
  )
}