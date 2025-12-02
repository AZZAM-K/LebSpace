import { useState } from 'react'

const suggestions = [
  {
    id: 1,
    name: 'Maya A.',
    username: '@maya_art',
    avatar: 'https://i.pravatar.cc/60?img=5',
  },
  {
    id: 2,
    name: 'Ali Design',
    username: '@alidesign',
    avatar: 'https://i.pravatar.cc/60?img=12',
  },
  {
    id: 3,
    name: 'Jad',
    username: '@jadking',
    avatar: 'https://i.pravatar.cc/60?img=25',
  },
  {
    id: 4,
    name: 'Rania',
    username: '@rania',
    avatar: 'https://i.pravatar.cc/60?img=33',
  },
  {
    id: 5,
    name: 'Khaled',
    username: '@khaled',
    avatar: 'https://i.pravatar.cc/60?img=18',
  },
  {
    id: 6,
    name: 'Tina',
    username: '@tinaa',
    avatar: 'https://i.pravatar.cc/60?img=44',
  },
]

const SideBar2 = () => {
  const [showMore, setShowMore] = useState(false)

  const visibleUsers = showMore ? suggestions : suggestions.slice(0, 5)

  return (
    <div
      className='
        hidden lg:block
        w-[300px]
        h-screen
        fixed
        right-0
        top-0
        bg-black/70
        backdrop-blur-xl
        p-5
        border-l border-white/10
        shadow-xl
        overflow-y-auto
        text-white
        mt-16
      '
    >
      <h2 className='text-2xl font-bold mb-6 text-white'>Suggested for you</h2>

      <div className='space-y-5'>
        {visibleUsers.map(user => (
          <div
            key={user.id}
            className='flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition duration-200 cursor-pointer'
          >
            <div className='flex items-center gap-3'>
              <img
                src={user.avatar}
                alt={user.name}
                className='w-12 h-12 rounded-full object-cover border border-orange-500/40 shadow-lg'
              />
              <div>
                <p className='font-semibold'>{user.name}</p>
                <p className='text-gray-400 text-sm'>{user.username}</p>
              </div>
            </div>

            <button className='px-4 py-1.5 rounded-xl bg-[#F65C21] text-black font-bold hover:opacity-90 transition-all active:scale-95 shadow-md'>
              Follow
            </button>
          </div>
        ))}
      </div>

      {suggestions.length > 5 && (
        <button
          onClick={() => setShowMore(!showMore)}
          className='w-full text-center mt-4 text-orange-400 font-semibold hover:text-orange-300 transition'
        >
          {showMore ? 'See Less' : 'See More'}
        </button>
      )}

      <hr className='border-white/10 my-6' />

      <p className='text-gray-400 text-xs text-center'>
        © 2025 LebSpace. All rights reserved.
      </p>
    </div>
  )
}

export default SideBar2
