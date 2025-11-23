import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AppContext } from '../Context/context'

const Login = () => {
  const { login } = useContext(AppContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    const res = await login(formData)
    if (res.success) {
      navigate('/')
    } else {
      setError(res.message)
    }
  }

  return (
    <div className='min-h-screen bg-black flex items-center justify-center p-4'>
      <div className='flex flex-col md:flex-row items-center gap-8 max-w-6xl w-full'>
        <div className='hidden md:block flex-1'>
          <img src='/Logo.png' alt='Logo' className='w-full object-contain' />
        </div>

        <div className='flex-1 w-full max-w-md p-10 bg-black rounded-xl shadow-2xl border border-gray-600'>
          {error && (
            <p className='bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm text-center'>
              {error}
            </p>
          )}

          <h2 className='text-3xl font-extrabold text-white text-center mb-8'>
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <input
              type='email'
              name='email'
              placeholder='Email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full px-4 py-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400'
            />

            <input
              type='password'
              name='password'
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
              required
              className='w-full px-4 py-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400'
            />

            <button
              type='submit'
              className='w-full py-3 mt-6 font-bold rounded-lg text-black bg-linear-to-r from-orange-600 to-orange-500 shadow-xl hover:opacity-90 transition-all duration-300'
            >
              Log in
            </button>
          </form>

          <div className='text-center pt-6 border-t border-gray-700 mt-8'>
            <p className='text-sm text-white'>
              Don't have an account?{' '}
              <Link
                to='/signup'
                className='text-[#F65C21] font-semibold hover:underline'
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
