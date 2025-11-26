import { useContext } from 'react'
import { AppContext } from '../Context/context'
import { Search } from 'lucide-react'
import { Link } from 'react-router'

const Navbar = () => {
  const { user } = useContext(AppContext)

  return (
    <nav className='w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto px-4 h-16 flex items-center justify-between'>
        <div className='text-xl font-bold md:hidden text-white'>LebSpace</div>
        <div className='hidden sm:block flex-1 max-w-lg mx-8'>
          <div className='relative'>
            <Search className='absolute left-3 top-2.5 text-gray-500 h-4 w-4' />
            <input
              type='text'
              placeholder='Search...'
              className='w-full bg-gray-900 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#F65C21]
               focus:outline-none text-gray-200'
            />
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <Link
            to='/profile'
            className='w-9 h-9 rounded-full bg-gray-800 overflow-hidden border border-[#F65C21]'
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
