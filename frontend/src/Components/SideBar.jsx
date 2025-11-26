import { useContext } from "react"
import { Home, Bell, Search, Mail, LogOut, Settings } from "lucide-react"
import { AppContext } from "../Context/context"
import { Link, useNavigate, useLocation } from "react-router-dom"

const ACCENT_COLOR_CLASS = "text-orange-400"
const HOVER_BG_CLASS = "hover:bg-gray-800/50"
const ACTIVE_BG_CLASS = "bg-gray-900"
const TEXT_DEFAULT_CLASS = "text-gray-400"
const TEXT_HOVER_CLASS = "hover:text-white"

const MenuItem = ({ Icon, label, to, inPage }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium cursor-pointer transition-all ${
        inPage
          ? 'bg-[#F65C21]/10 text-[#F65C21]'
          : 'text-gray-400 hover:text-white hover:bg-gray-900'
      }`}
    >
      <Icon size={24} className='min-w-[24]' />
      <span className='hidden lg:inline'>{label}</span>
    </Link>
  )
}

const MobileNavItem = ({ Icon, path, label }) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <button
      onClick={() => navigate(path)}
      aria-label={`Go to ${label}`}
      className={`flex flex-col items-center transition transform active:scale-90 duration-150
        ${
          location.pathname === path
            ? ACCENT_COLOR_CLASS
            : "text-gray-500 hover:text-white"
        }`}
    >
      <Icon size={28} />
    </button>
  )
}

const SideBar = () => {
  const { logout, user } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const username = user?.username || "Guest"

  return (
    <>
      <div className='hidden md:flex w-20 lg:w-72 h-screen fixed left-0 top-0 bg-black border-r border-gray-900 flex-col p-2 lg:p-5 z-50 transition-all duration-300 ease-in-out'>
        <Link
          to='/'
          className='flex items-center mb-10 p-1 lg:pl-2'
          aria-label='Go to Home'
        >
          <img
            src='/Logo.png'
            alt='LebSpace Logo'
            className='w-10 h-10 lg:w-16 lg:h-16 rounded-xl object-cover'
          />
          <span className='hidden lg:flex text-2xl font-extrabold text-white tracking-wider ml-2 items-center gap-1'>
            <span className='text-orange-400'>Leb</span>Space
          </span>
        </Link>

        <nav className='space-y-1 flex-1'>
          <MenuItem
            Icon={Home}
            label='Home'
            to='/'
            inPage={location.pathname === "/"}
          />
          <MenuItem
            Icon={Bell}
            label='Notifications'
            to='/notifications'
            inPage={location.pathname === "/notifications"}
          />
          <MenuItem
            Icon={Mail}
            label='Messages'
            to='/messages'
            inPage={location.pathname === "/messages"}
          />
          <MenuItem
            Icon={Settings}
            label='Settings'
            to='/settings'
            inPage={location.pathname === "/settings"}
          />
        </nav>

        <div className='border-t border-gray-800 pt-4'>
          <Link
            to='/profile'
            className={`flex items-center gap-3 p-3 rounded-full ${HOVER_BG_CLASS} transition-all cursor-pointer mb-2`}
          >
            <div className='w-10 h-10 rounded-full bg-gray-800 overflow-hidden border-2 border-orange-400 '>
              <img
                src={
                  user?.profilePicture?.url ||
                  `https://ui-avatars.com/api/?name=${username}&background=1f2937&color=fbbf24&bold=true`
                }
                alt={`${username}'s Profile`}
                className='w-full h-full object-cover'
              />
            </div>
            <div className='hidden lg:block'>
              <p className='text-white font-semibold truncate'>@{username}</p>
              <p className='text-gray-500 text-sm'>View Profile</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            aria-label='Log out of the application'
            className='flex items-center gap-4 p-3 rounded-full text-lg font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/40 transition-all w-full text-left'
          >
            <LogOut size={24} className='min-w-[24]' />
            <span className='hidden lg:inline'>Log Out</span>
          </button>
        </div>
      </div>

      <div className='md:hidden fixed bottom-0 left-0 right-0 z-50'>
        <div
          className='fixed h-20 bottom-0 left-0 right-0
            w-full bg-black/90 backdrop-blur-md 
            border-t border-orange-500/50 
            py-3 px-6 flex justify-around items-center
            shadow-[0_-8px_30px_rgba(0,0,0,0.8)]'
        >
          <MobileNavItem Icon={Home} path='/' label='Home' />
          <MobileNavItem Icon={Search} path='/explore' label='Explore' />

          <MobileNavItem Icon={Mail} path='/messages' label='Messages' />

          <Link
            to={"/profile"}
            className={
              "w-10 h-10 rounded-full bg-gray-800 overflow-hidden border-2 transition-all duration-150"
            }
          >
            <img
              src={
                user?.profilePicture?.url ||
                `https://ui-avatars.com/api/?name=${username}&background=1f2937&color=fbbf24&bold=true`
              }
              alt='Profile'
              className='w-full h-full rounded-full object-cover'
            />
          </Link>
        </div>
      </div>
    </>
  )
}

export default SideBar
