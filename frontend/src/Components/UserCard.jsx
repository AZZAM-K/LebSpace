import { Link } from 'react-router'

const UserCard = ({ id, username, fullName, avatar }) => {
  return (
    <div className='flex items-center justify-between p-4 hover:bg-gray-900/50 rounded-xl transition-colors group'>
      <div className='flex items-center gap-3 overflow-hidden'>
        <img
          src={avatar}
          alt={username}
          className='w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-gray-700 transition-all'
        />
        <div className='flex flex-col min-w-0'>
          <span className='text-white font-semibold text-sm truncate'>
            {username}
          </span>
          <span className='text-gray-400 text-xs truncate'>{fullName}</span>
        </div>
      </div>

      <Link
        to={`/users/${id}`}
        className='
          px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[100px] flex items-center justify-center
           bg-[#F65C21] text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-900/20'
      >
        View Profile
      </Link>
    </div>
  )
}

export default UserCard
