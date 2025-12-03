import { useContext } from 'react'
import { Home, Bell, Search, Mail, Plus, LogOut, Settings } from 'lucide-react'
import { AppContext } from '../Context/context'
import { Link, useNavigate, useLocation } from 'react-router-dom'

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
      <Icon size={22} />
      <span>{label}</span>
    </Link>
  )
}

const SideBar = () => {
  const { logout, user } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const userAvatarUrl =
    user?.img ||
    `https://ui-avatars.com/api/?name=${
      user?.username || 'User'
    }&background=random&color=fff&size=40`

  return (
    <>
      <div className='hidden md:flex w-64 h-screen fixed left-0 top-0 bg-black border-r border-gray-800 flex-col p-5 z-50'>
        <Link to='/' className='flex items-center gap-2 mb-10 pl-2'>
          <img
            src='/Logo.png'
            alt='LebSpace'
            className='w-16 h-16 rounded-xl object-cover'
          />
          <div className='text-2xl font-bold text-white tracking-wide'>
            LebSpace
          </div>
        </Link>
        <div className='space-y-2 flex-1'>
          <MenuItem
            Icon={Home}
            label='Home'
            to='/'
            inPage={location.pathname === '/'}
          />
          <MenuItem
            Icon={Bell}
            label='Notifications'
            to='/notifications'
            inPage={location.pathname === '/notifications'}
          />

          <MenuItem
            Icon={Mail}
            label='Messages'
            to='/messages'
            inPage={location.pathname === '/messages'}
          />
          <MenuItem
            Icon={Settings}
            label='Settings'
            to='/settings'
            inPage={location.pathname === '/settings'}
          />
        </div>

        <div className='border-t border-gray-800 pt-4'>
          <button
            onClick={handleLogout}
            className='flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium text-gray-400 hover:text-red-500
             hover:bg-red-500/10 transition-all w-full text-left'
          >
            <LogOut size={22} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
      <div className='md:hidden fixed bottom-0 left-0 right-0 z-50'>
        <div
          className='fixed h-20 bottom-0 left-0 right-0
 w-full bg-black/80 backdrop-blur-xl 
 border-t border-[#F65C21]
 py-3 px-3 flex justify-around items-center
 md:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.4)]'
        >
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center transition transform active:scale-90 
     ${location.pathname === '/' ? 'text-orange-500' : 'text-gray-400'}`}
          >
            <Home size={32} />
          </button>

          <button
            onClick={() => navigate('/search')}
            className={`flex flex-col items-center transition transform active:scale-90
     ${location.pathname === '/search' ? 'text-orange-500' : 'text-gray-400'}`}
          >
            <Search size={32} />
          </button>

          <button
            onClick={() => navigate('/add-post')}
            className={`flex flex-col items-center transition transform active:scale-90
     ${
       location.pathname === '/add-post' ? 'text-orange-500' : 'text-gray-400'
     }`}
          >
            <Plus size={32} />
          </button>

          <button
            onClick={() => navigate('/messages')}
            className={`flex flex-col items-center transition transform active:scale-90
     ${
       location.pathname === '/messages' ? 'text-orange-500' : 'text-gray-400'
     }`}
          >
            <Mail size={32} />
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`
    flex flex-col items-center justify-center
    transition-transform duration-150
    active:scale-90
    border-2
    rounded-full
    ${
      location.pathname === '/profile' ? 'border-orange-500' : 'border-gray-400'
    }
  `}
          >
            <img
              src={userAvatarUrl}
              alt={user?.username || 'User Profile'}
              className={`
      w-10 h-10 rounded-full object-cover
      ${
        location.pathname === '/profile'
          ? 'border-2 border-orange-500'
          : 'border-2 border-gray-400'
      }
    `}
            />
          </button>
        </div>
      </div>
    </>
  )
}

export default SideBar
