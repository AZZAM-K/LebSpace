import { useContext, useEffect, useEffectEvent } from 'react'
import Navbar from './Navbar'
import SideBar from './SideBar'
import { Outlet, useNavigate } from 'react-router'
import { AppContext } from '../Context/context'

const Layout = () => {
  const { user } = useContext(AppContext)
  const navigate = useNavigate()

  const navigateEvent = useEffectEvent(() => {
    if (!user) navigate('/login')
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
