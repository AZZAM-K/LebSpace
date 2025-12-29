import { useContext, useEffect, useEffectEvent } from 'react'
import Navbar from './Navbar'
import SideBar from './SideBar'
import { Outlet, useNavigate } from 'react-router'
import { AppContext } from '../Context/context'

const Layout = () => {
  const { user, logout } = useContext(AppContext)
  const navigate = useNavigate()
  const expiryDate = localStorage.getItem('expiryDate') || null

  const navigateEvent = useEffectEvent(() => {
    if (!user || !expiryDate) navigate('/login')

    const expiry = new Date(expiryDate)
    const now = new Date()
    if (now >= expiry) {
      logout()
      navigate('/login')
    }
  })

  useEffect(() => {
    navigateEvent()
  }, [user])

  return (
    <main className='min-h-screen bg-[#0a0a0a] font-sans flex text-gray-100'>
      <SideBar />
      <div className='flex-1 flex flex-col md:ml-64 relative'>
        <Navbar />
        <Outlet />
      </div>
    </main>
  )
}

export default Layout
