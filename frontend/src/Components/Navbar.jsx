import { useContext } from "react"
import { AppContext } from "../Context/context"
import { Plus, Search, Bell, PlusCircle } from "lucide-react"
import { Link } from "react-router"

const Navbar = () => {
  const { user } = useContext(AppContext)

  return (
    <nav className='w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto sm:px-6 lg:px-8 h-16 flex items-center justify-between'>
        <div className='ml-5'>
          <Bell size={30} className='text-orange-600 block md:hidden' />
        </div>

        <div className='text-xl font-bold ml-5 md:hidden text-white'>
            <span className='text-orange-500'>Leb</span>Space
        </div>

        <div className='hidden sm:flex flex-1 max-w-lg mx-4'>
          <div className='relative w-full'>
            <Search className='absolute left-3 top-2.5 text-gray-500 h-4 w-4' />
            <input
              type='text'
              placeholder='Search...'
              className='w-full bg-gray-900 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#F65C21]
                     focus:outline-none text-gray-200'
            />
          </div>
        </div>

        <div className='flex items-center mr-5'>
          <Link
            to={"/add-post"}
            className='
              flex items-center gap-2 
              py-2 px-4 md:px-6 
              rounded-full 
              bg-orange-600 text-white 
              font-semibold text-base 
              transition-all duration-300
              shadow-lg shadow-orange-600/40
              hover:bg-orange-500 
              hover:scale-[1.03] 
              active:scale-95
            '
          >
            <PlusCircle size={20} className='text-white' />
            <span className='hidden sm:block'>Create Post</span>
          </Link>
        </div>

        <div className='items-center md:flex hidden gap-4'>
          <Link
            to='/profile'
            className='w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-800 overflow-hidden border border-[#F65C21]'
          >
            <img
              src={
                user?.img ||
                `https://ui-avatars.com/api/?name=${user?.username}&background=random`
              }
              alt={user?.username}
              className='w-full h-full object-cover'
            />
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
