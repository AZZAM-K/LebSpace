import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { AppContext } from '../Context/context'
import {
  Search as SearchIcon,
  ArrowRight,
  XCircle,
  Loader2,
} from 'lucide-react'

const Search = () => {
  const { searchUsers } = useContext(AppContext)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async e => {
    const value = e.target.value
    setQuery(value)

    if (!value.trim()) {
      setResults([])
      setError('')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await searchUsers(value)

      if (!res.success) {
        setError(res.message || 'Failed to fetch results.')
        setResults([])
        return
      }

      setResults(res.data || [])
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during search.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setError('')
  }

  return (
    <div className='p-8 w-full md:w-[90%]  mx-auto font-sans'>
      <div className='relative mb-6'>
        <input
          type='text'
          placeholder='Search for a user by name or username...'
          value={query}
          onChange={handleSearch}
          className={`
            w-full py-3 pl-4 pr-12 text-lg text-white bg-gray-900 
            border-2 border-gray-200 rounded-xl outline-none transition-all duration-200
            focus:border-orange-500 focus:ring-1 focus:ring-orange-500
          `}
        />

        {query.length > 0 ? (
          <XCircle
            size={24}
            onClick={clearSearch}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 cursor-pointer hover:text-red-600 transition'
          />
        ) : (
          <SearchIcon
            size={24}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          />
        )}
      </div>

      {loading && (
        <p className='text-center py-4 text-orange-600 flex items-center justify-center font-medium'>
          <Loader2 size={20} className='mr-2 animate-spin' /> Loading users...
        </p>
      )}
      {error && (
        <p className='text-center py-4 text-red-600 font-medium border border-red-200 bg-red-50 rounded-lg'>
          <div className='flex items-center justify-center'>
            <XCircle size={18} className='mr-2' /> {error}
          </div>
        </p>
      )}

      <div className=' flex flex-col gap-4'>
        {results.length === 0 && query.length > 0 && !loading && !error && (
          <p className='text-center py-4 text-gray-300 italic'>
            No users found matching "{query}".
          </p>
        )}

        {results.map(user => (
          <div
            key={user._id}
            onClick={() => navigate(`/users/${user._id}`)}
            className='
              flex items-center justify-between gap-4 p-4 
              bg-gray-900 rounded-xl border border-gray-100 shadow-md cursor-pointer 
              transition duration-200 ease-in-out
              hover:bg-gray-950 hover:shadow-lg hover:border-orange-800
              transform hover:-translate-y-0.5
            '
          >
            <div className='flex items-center gap-4'>
              <img
                src={user.profilePicture?.url || '/default.jpg'}
                alt={`${user.fullName}'s profile`}
                className='w-14 h-14 rounded-full object-cover border-2 border-orange-700 '
                style={{ border: '2px solid #ea580c' }}
              />

              <div className='flex flex-col'>
                <p className='font-semibold text-white text-lg'>
                  {user.fullName}
                </p>
                <p className='text-sm text-gray-500'>@{user.username}</p>
              </div>
            </div>
            <ArrowRight size={20} className='text-orange-600' />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Search
