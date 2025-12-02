import { useContext } from "react"
import { AppContext } from "../Context/context"
import { Bell, Plus, Search } from "lucide-react"
import { Link } from "react-router-dom"

const Navbar = () => {
  const { user } = useContext(AppContext)

  const userAvatarUrl =
    user?.img ||
    `https://ui-avatars.com/api/?name=${
      user?.username || "User"
    }&background=random&color=fff&size=40`

  const iconBaseClasses = "w-6 h-6 transition duration-200"
  const buttonBaseClasses =
    "p-2 rounded-full transition-colors duration-200 active:scale-95"
  const accentColor = "text-orange-500"
  const bgAccentHover = "hover:bg-orange-600"
  const iconColor = "text-gray-300"

  return (
    <nav className='w-full mb-5 bg-black/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-40'>
      <div className='md:ml-33 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between md:justify-end'>
        <div className='text-2xl block md:hidden font-extrabold text-white tracking-wide select-none'>
          #<span className={accentColor}>Leb</span>Space
        </div>

        <div className='flex items-center space-x-2 sm:space-x-4'>
          <Link
            to='/search'
            className={`hidden sm:flex items-center justify-center ${buttonBaseClasses} bg-gray-900 ${bgAccentHover}`}
            aria-label='Search'
          >
            <Search
              className={`${iconBaseClasses} ${iconColor} group-hover:text-white`}
            />
          </Link>
          <div className="hidden md:block">
            <Link
              to='/add-post'
              className={`
              flex items-center  justify-center px-4 py-2 rounded-full 
              font-semibold text-white bg-orange-600 shadow-lg shadow-orange-600/30
              transition duration-200 ease-in-out active:scale-[.98]
              hover:bg-orange-700
            `}
            >
              <Plus size={20} className='mr-1' />
              <span className='hidden sm:inline'>Add Post</span>
            </Link>
          </div>

          <Link to={'notifications'}
            className={`${buttonBaseClasses} bg-gray-900 block md:hidden hover:bg-gray-800`}
            aria-label='Notifications'
          >
            <Bell className={`${iconBaseClasses} ${iconColor}`} />
          </Link>

          <Link
            to='/profile'
            className='w-10 h-10 hidden md:block rounded-full bg-gray-800 overflow-hidden border-2 border-orange-500 transition duration-200 hover:opacity-80'
            aria-label='User Profile'
          >
            <img
              src={userAvatarUrl}
              alt={user?.username || "User Profile"}
              className='w-full h-full object-cover'
            />
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
