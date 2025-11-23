import Navbar from '../Components/Navbar'
import SideBar from '../Components/SideBar'
import SideBar2 from '../Components/SideBar2'

const Home = () => {
  return (
    <div className='flex flex-1 p-4 md:p-8 gap-6 pb-24 md:pb-8 overflow-y-auto'>
      <div className='hidden lg:block w-[400px] shrink-0'>
        <SideBar2 />
      </div>
      <div className='flex-1 text-amber-50'></div>
    </div>
  )
}

export default Home
