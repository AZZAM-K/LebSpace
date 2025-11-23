import Navbar from './Navbar'
import SideBar from './SideBar'
import { Outlet } from 'react-router'

const Layout = () => {
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
