import { useContext, useState, useEffect, useEffectEvent } from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, Search, Users, Loader2 } from 'lucide-react'
import { AppContext } from '../Context/context'
import UserCard from '../Components/UserCard.jsx'

const Followers = () => {
  const { id } = useParams()
  const { getFollowers } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('followers')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [people, setPeople] = useState({
    followers: [],
    following: [],
  })

  const fetchFollowersEvent = useEffectEvent(async () => {
    const result = await getFollowers(id)
    if (!result.success) {
      setError(result.message || 'Failed to load followers')
    }
    setPeople(result.data)
    console.log('data:', result.data)
    setLoading(false)
  })

  useEffect(() => {
    fetchFollowersEvent()
  }, [])

  if (error) {
    return (
      <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center text-red-500'>
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-[#0a0a0a] flex items-center justify-center'>
        <Loader2 className='w-12 h-12 text-gray-600 animate-spin' />
      </div>
    )
  }

  const data = activeTab === 'followers' ? people.followers : people.following

  // Filter logic
  const filteredData = data.filter(
    u =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatNumber = num => {
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    }
    return num.toString()
  }
  const nbFollowers = formatNumber(people.followers.length)
  const nbFollowing = formatNumber(people.following.length)

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white w-full'>
      <div className='max-w-2xl mx-auto pt-6 px-0 sm:px-4'>
        <div className='flex items-center gap-4 px-4 mb-6'>
          <Link
            to={`/users/${id}`}
            className='p-2 rounded-full hover:bg-gray-800 transition'
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className='text-xl font-bold'>
            {activeTab === 'followers' ? 'Followers' : 'Following'}
          </h1>
          <span className='text-gray-500 text-sm mt-1 ml-auto md:ml-2'>
            {activeTab === 'followers' ? nbFollowers : nbFollowing}
          </span>
        </div>

        <div className='flex border-b border-gray-800 mb-4 mx-4 sm:mx-0 sticky top-16 bg-[#0a0a0a]/95 backdrop-blur z-30'>
          <button
            onClick={() => {
              setActiveTab('followers')
              setSearchQuery('')
            }}
            className={`flex-1 pb-3 text-sm font-medium transition-all relative ${
              activeTab === 'followers'
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {nbFollowers} Followers
            {activeTab === 'followers' && (
              <span className='absolute bottom-0 left-0 w-full h-0.5 bg-[#F65C21] rounded-t-full shadow-[0_-2px_10px_rgba(246,92,33,0.5)]' />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('following')
              setSearchQuery('')
            }}
            className={`flex-1 pb-3 text-sm font-medium transition-all relative ${
              activeTab === 'following'
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {nbFollowing} Following
            {activeTab === 'following' && (
              <span
                className='absolute bottom-0 left-0 w-full h-0.5 bg-[#F65C21] rounded-t-full
               shadow-[0_-2px_10px_rgba(246,92,33,0.5)]'
              />
            )}
          </button>
        </div>

        <div className='px-4 mb-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 text-gray-500 w-4 h-4' />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className='w-full bg-[#161616] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white
               focus:border-[#F65C21] focus:outline-none transition-colors placeholder-gray-600'
            />
          </div>
        </div>

        <div className='px-2 sm:px-0 pb-20'>
          {filteredData.length > 0 ? (
            <div className='flex flex-col gap-1'>
              {filteredData.map(user => (
                <UserCard
                  key={user._id}
                  id={user._id}
                  username={user.username}
                  fullName={user.fullName}
                  avatar={
                    user.profilePicture.url ||
                    `https://ui-avatars.com/api/?name=${user.username}&background=random`
                  }
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className='flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300'>
              <div className='w-20 h-20 bg-[#161616] rounded-full flex items-center justify-center mb-4'>
                <Users className='text-gray-600 w-10 h-10' />
              </div>
              <h3 className='text-lg font-bold text-white mb-1'>
                {searchQuery
                  ? 'No results found'
                  : activeTab === 'followers'
                  ? 'No followers yet'
                  : 'Not following anyone'}
              </h3>
              <p className='text-gray-500 text-sm max-w-xs'>
                {searchQuery
                  ? `We couldn't find anyone named "${searchQuery}"`
                  : activeTab === 'followers'
                  ? "When people follow you, you'll see them here."
                  : 'Start following people to see their posts in your feed.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Followers
