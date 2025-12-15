import SideBar2 from '../Components/SideBar2'
import Story from '../Components/Story'
import HomePage from '../Components/HomePage'

const Home = () => {
  return (
    <div className='pb-30 md:flex md:justify-center md:gap-6 lg:gap-8 px-2 sm:px-4'>
      <div className='w-full px-2 sm:px-4 md:max-w-7xl md:mx-auto'>
        <Story />

        <div className='mt-6'>
          <HomePage />
        </div>
      </div>

      <div className='hidden lg:block w-[300px] shrink-0'>
        <SideBar2 />
      </div>
    </div>
  )
}

export default Home
