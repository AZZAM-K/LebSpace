import { useContext, useState, useRef } from 'react'
import { AppContext } from '../Context/context'
import {
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
} from 'lucide-react'
import { useNavigate } from 'react-router'

const EditProfile = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useContext(AppContext)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    username: user.username,
    fullName: user.fullName,
    bio: user.bio,
  })

  const [previewImage, setPreviewImage] = useState(user.img || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError(null)
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setPreviewImage(imageUrl)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const data = new FormData()
      data.append('username', formData.username)
      data.append('fullName', formData.fullName)
      data.append('bio', formData.bio)

      if (fileInputRef.current.files[0]) {
        data.append('avatar', fileInputRef.current.files[0])
      }

      const result = await updateProfile(data)
      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.message || 'Failed to update profile')
      }
    } catch (error) {
      setError(error.message || 'Something went wrong')
    }

    setIsLoading(false)
  }

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white w-full pb-20'>
      <div className='max-w-3xl mx-auto pt-8 px-4 sm:px-6'>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>Edit Profile</h1>
        <p className='text-gray-400 mb-8'>
          Customize how people see you on LebSpace.
        </p>

        <div className='bg-[#121212] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative'>
          {error && (
            <div
              className='absolute top-0 left-0 w-full bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex
             items-center gap-3 text-red-400'
            >
              <AlertCircle size={20} />
              <span className='text-sm font-medium'>{error}</span>
            </div>
          )}

          {success && (
            <div
              className='absolute top-0 left-0 w-full bg-green-500/10 border-b border-green-500/20 px-6 py-3 flex
             items-center gap-3 text-green-400'
            >
              <CheckCircle2 size={20} />
              <span className='text-sm font-medium'>
                Profile updated successfully!
              </span>
            </div>
          )}

          <div className='p-6 md:p-10 mt-6'>
            <form onSubmit={handleSubmit} className='space-y-8'>
              <div className='flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-gray-800'>
                <div className='relative group cursor-pointer'>
                  <div
                    className='w-32 h-32 rounded-full p-1 bg-linear-to-br from-gray-700 to-gray-900 ring-2 ring-offset-4
                   ring-offset-[#121212] ring-[#F65C21]/50 group-hover:ring-[#F65C21] transition-all duration-300'
                  >
                    <img
                      src={
                        previewImage ||
                        `https://ui-avatars.com/api/?name=${user.username}&background=random`
                      }
                      alt='Profile Preview'
                      className='w-full h-full rounded-full object-cover'
                    />
                  </div>
                  <label
                    htmlFor='file-upload'
                    className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0
                     group-hover:opacity-100 transition-opacity duration-200'
                  >
                    <Camera className='text-white w-8 h-8' />
                  </label>
                  <input
                    id='file-upload'
                    type='file'
                    name='avatar'
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                </div>

                <div className='text-center sm:text-left space-y-2'>
                  <h3 className='text-lg font-medium text-white'>
                    Profile Photo
                  </h3>
                  <p className='text-sm text-gray-400 max-w-xs'>
                    Recommended 300x300px. JPG, PNG or GIF allowed.
                  </p>
                  <div className='flex gap-3 justify-center sm:justify-start pt-2'>
                    <label
                      htmlFor='file-upload'
                      className='px-4 py-2 bg-[#F65C21] hover:bg-orange-600 text-white text-sm font-semibold
                       rounded-lg cursor-pointer transition-colors shadow-lg shadow-orange-900/20'
                    >
                      Change Photo
                    </label>
                    <button
                      type='button'
                      className='px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg
                       transition-colors'
                      onClick={() => {
                        fileInputRef.current.value = null
                        setPreviewImage(null)
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-300 ml-1'>
                    Username
                  </label>
                  <div className='relative'>
                    <span className='absolute left-3 top-2.5 text-gray-500 select-none'>
                      @
                    </span>
                    <input
                      type='text'
                      name='username'
                      value={formData.username}
                      onChange={handleChange}
                      className='w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-8 pr-4 text-white
                       focus:border-[#F65C21] focus:ring-1 focus:ring-[#F65C21] focus:outline-none transition-all
                        placeholder-gray-600'
                      placeholder='username'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-300 ml-1'>
                    Display Name
                  </label>
                  <div className='relative'>
                    <User className='absolute left-3 top-2.5 w-4 h-4 text-gray-500' />
                    <input
                      type='text'
                      name='fullName'
                      value={formData.fullName}
                      onChange={handleChange}
                      className='w-full bg-black border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-white
                       focus:border-[#F65C21] focus:ring-1 focus:ring-[#F65C21] focus:outline-none transition-all
                        placeholder-gray-600'
                      placeholder='Full Name'
                      required
                    />
                  </div>
                </div>

                <div className='col-span-1 md:col-span-2 space-y-2'>
                  <div className='flex justify-between ml-1'>
                    <label className='text-sm font-medium text-gray-300'>
                      Bio
                    </label>
                    <span
                      className={`text-xs ${
                        formData.bio.length > 150
                          ? 'text-red-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {formData.bio.length}/150
                    </span>
                  </div>
                  <textarea
                    name='bio'
                    rows='4'
                    value={formData.bio}
                    onChange={handleChange}
                    className='w-full bg-black border border-gray-700 rounded-xl py-3 px-4 text-white
                     focus:border-[#F65C21] focus:ring-1 focus:ring-[#F65C21] focus:outline-none transition-all
                      placeholder-gray-600 resize-none leading-relaxed'
                    placeholder='Tell us a little about yourself...'
                  ></textarea>
                  <p className='text-xs text-gray-500 pl-1'>
                    This will be displayed on your profile. Mention your
                    hobbies, location, or what you're up to.
                  </p>
                </div>
              </div>

              <div className='flex items-center justify-end gap-4 pt-4 border-t border-gray-800'>
                <button
                  type='button'
                  onClick={() => navigate('/profile')}
                  disabled={isLoading}
                  className='px-6 py-2.5 rounded-xl text-gray-300 font-medium hover:text-white hover:bg-gray-800 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isLoading}
                  className={`
                                flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg
                                 shadow-orange-900/20
                                ${
                                  isLoading
                                    ? 'bg-gray-700 cursor-not-allowed'
                                    : 'bg-[#F65C21] hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98]'
                                }
                            `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className='w-5 h-5' />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile
