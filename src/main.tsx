import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'
import MembersOnly from './members/MembersOnly'

const router = createBrowserRouter([
  { path: '/', element: <ComingSoon /> },
  { path: '/members', element: <MembersOnly /> },
  { path: '/login', element: <div className="min-h-screen grid place-items-center text-white bg-black">Redirecting to Whop…</div> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)