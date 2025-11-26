import SideBar2 from "../Components/SideBar2"
import Story from "../Components/Story"

const Home = () => {
  return (
    <div className='flex flex-1 flex-col md:flex-row p-4 md:p-8 gap-6 pb-24 md:pb-8 overflow-y-auto dark:bg-gray-900/40'>
      <div className='w-90 md:w-full px-2 sm:px-4 md:max-w-7xl mx-auto'>
        <Story />
      </div>

      <div className='hidden lg:block w-[300px] shrink-0'>
        <SideBar2 />
      </div>
    </div>
  )
}

export default Home
