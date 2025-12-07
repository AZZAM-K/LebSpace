import {
  Shield,
  Key,
  AlertTriangle,
  CheckCircle2,
  Users,
  Trash2,
  X,
  Loader2,
  EyeOff,
  Eye,
  ChevronUp,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { useContext, useEffect, useState, useEffectEvent } from 'react'
import { AppContext } from '../Context/context'
import { useNavigate } from 'react-router'

const Settings = () => {
  const {
    getSettingsData,
    togglePrivacy,
    changePassword,
    unblockUser,
    deleteAccount,
    logout,
  } = useContext(AppContext)
  const navigate = useNavigate()

  const [isPrivate, setIsPrivate] = useState(false)
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [deletePass, setDeletePass] = useState({ password: '' })
  const [blockedUsers, setBlockedUsers] = useState([])
  const [isBlockedListOpen, setIsBlockedListOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passMessage, setPassMessage] = useState({ type: '', text: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [changing, setChanging] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchSettingsEvent = useEffectEvent(async () => {
    const result = await getSettingsData()
    if (!result.success) {
      setError(result.message || 'Failed to load settings')
    }
    setIsPrivate(result.data.isPrivate)
    setBlockedUsers(result.data.blockedUsers)
    setLoading(false)
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    fetchSettingsEvent()
  }, [])

  const handleToggling = async () => {
    try {
      setToggling(true)
      const res = await togglePrivacy()
      if (!res.success) {
        setError(res.message)
        return
      }

      setIsPrivate(prev => !prev)
      setToggling(false)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleChangePassword = async e => {
    e.preventDefault()
    try {
      if (passData.newPassword !== confirmPassword) {
        setPassMessage({ type: 'error', text: 'Passwords do not match' })
        return
      }
      setChanging(true)
      const res = await changePassword(deletePass)
      if (res.success) {
        setPassMessage({ type: '', text: res.message })
      } else {
        setPassMessage({ type: 'error', text: res.message })
      }
    } catch (error) {
      setPassMessage({ type: 'error', text: error.message })
    } finally {
      setChanging(false)
    }
  }

  const handleDeleteAccount = async e => {
    e.preventDefault()
    try {
      setDeleting(true)
      const res = await deleteAccount(deletePass)
      if (!res.success) {
        setDeleteError(res.message)
      }
    } catch (error) {
      setDeleteError(error.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleUnblocking = async id => {
    try {
      const res = await unblockUser(id)
      if (!res.success) {
        setError(res.message)
        return
      }

      setBlockedUsers(prev => prev.filter(user => user._id !== id))
    } catch (error) {
      setError(error.message)
    }
  }

  if (error) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center text-red-500'>
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

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white w-full pb-20 md:pb-10 relative'>
      <div className='max-w-3xl mx-auto pt-8 px-4 sm:px-6'>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>Settings</h1>
        <p className='text-gray-400 mb-8'>
          Manage your privacy, security, and account preferences.
        </p>

        <div className='space-y-6'>
          <div className='bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-sm'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='p-3 bg-blue-500/10 rounded-xl'>
                <Shield className='text-blue-500 w-6 h-6' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Account Privacy</h3>
                <p className='text-sm text-gray-500'>
                  Control who can see your content.
                </p>
              </div>
            </div>

            <div className='flex flex-wrap gap-2 items-center justify-between bg-black/40 p-4 rounded-xl border border-gray-800/50'>
              <div className='flex flex-col'>
                <span className='font-medium text-gray-200'>
                  Private Account
                </span>
                <span className='text-xs text-gray-500 mt-1'>
                  {toggling
                    ? 'changing privacy settings'
                    : isPrivate
                    ? 'Only followers can see your photos and videos.'
                    : 'Anyone on or off LebSpace can see your content.'}
                </span>
              </div>

              <button
                disabled={toggling}
                onClick={handleToggling}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2
                 focus:ring-[#F65C21]/50 ${
                   isPrivate ? 'bg-[#F65C21]' : 'bg-gray-700'
                 }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    isPrivate ? 'translate-x-1' : '-translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className='bg-[#121212] border border-gray-800 rounded-2xl p-6 shadow-sm'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='p-3 bg-green-500/10 rounded-xl'>
                <Key className='text-green-500 w-6 h-6' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Change Password</h3>
                <p className='text-sm text-gray-500'>
                  Update your password to keep your account secure.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className='space-y-4 max-w-lg'
            >
              {passMessage.text && (
                <div
                  className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                    passMessage.type === 'error'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-green-500/10 text-green-400'
                  }`}
                >
                  {passMessage.type === 'error' ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {passMessage.text}
                </div>
              )}

              <div className='space-y-1'>
                <label className='text-sm font-medium text-gray-400'>
                  Current Password
                </label>
                <input
                  type='password'
                  value={passData.currentPassword}
                  onChange={e =>
                    setPassData({
                      ...passData,
                      currentPassword: e.target.value,
                    })
                  }
                  className='w-full bg-black border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#F65C21]
                   focus:ring-1 focus:ring-[#F65C21] focus:outline-none'
                  placeholder='Enter current password'
                  required
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-gray-400'>
                    New Password
                  </label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passData.newPassword}
                      onChange={e =>
                        setPassData({
                          ...passData,
                          newPassword: e.target.value,
                        })
                      }
                      className='w-full bg-black border border-gray-700 rounded-lg p-2.5 pr-10 text-white focus:border-[#F65C21]
                       focus:ring-1 focus:ring-[#F65C21] focus:outline-none'
                      placeholder='New password'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-3.5 text-gray-500 hover:text-white'
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className='space-y-1'>
                  <label className='text-sm font-medium text-gray-400'>
                    Confirm New
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className='w-full bg-black border border-gray-700 rounded-lg p-2.5 text-white focus:border-[#F65C21]
                     focus:ring-1 focus:ring-[#F65C21] focus:outline-none'
                    placeholder='Confirm password'
                    required
                  />
                </div>
              </div>

              <div className='pt-2'>
                <button
                  type='submit'
                  disabled={changing}
                  className='px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm'
                >
                  {changing ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className='bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300'>
            <button
              onClick={() => setIsBlockedListOpen(!isBlockedListOpen)}
              className='w-full p-6 flex items-center justify-between hover:bg-gray-900/50 transition-colors'
            >
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-purple-500/10 rounded-xl'>
                  <Users className='text-purple-500 w-6 h-6' />
                </div>
                <div className='text-left'>
                  <h3 className='text-lg font-semibold'>Blocked Users</h3>
                  <p className='text-sm text-gray-500'>
                    Manage accounts you have blocked.
                  </p>
                </div>
              </div>
              {isBlockedListOpen ? (
                <ChevronUp className='text-gray-400' />
              ) : (
                <ChevronDown className='text-gray-400' />
              )}
            </button>

            {isBlockedListOpen && (
              <div className='px-6 pb-6 border-t border-gray-800 animate-in'>
                {blockedUsers.length > 0 ? (
                  <div className='divide-y divide-gray-800'>
                    {blockedUsers.map(user => (
                      <div
                        key={user._id}
                        className='flex items-center justify-between py-4'
                      >
                        <div className='flex items-center gap-3'>
                          <img
                            src={
                              user.profilePicture.url ||
                              `https://ui-avatars.com/api/?name=${user.username}&background=random`
                            }
                            alt='blocked'
                            className='w-10 h-10 rounded-full bg-gray-700 object-cover grayscale opacity-70'
                          />
                          <div>
                            <p className='font-medium text-gray-300'>
                              {user.username}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {user.fullName}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblocking(user._id)}
                          className='px-3 py-1 text-xs border border-gray-600 rounded-lg hover:bg-white hover:text-black
                           hover:border-white transition-all text-gray-300'
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='py-8 text-center text-gray-500 text-sm'>
                    You haven't blocked anyone yet.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='border border-red-900/30 bg-red-900/5 rounded-2xl p-6 mt-10'>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-red-500 font-bold text-lg flex items-center gap-2'>
                  <Trash2 size={20} /> Delete Account
                </h3>
                <p className='text-gray-400 text-sm mt-1 max-w-sm'>
                  Permanently delete your account and all of your content. This
                  action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className='px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-semibold text-sm
                 hover:bg-red-500 hover:text-white transition-all'
              >
                Delete Account
              </button>
            </div>
          </div>
          <div className='border-t border-gray-800 pt-4'>
            <button
              onClick={handleLogout}
              className='flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all w-full text-left'
            >
              <LogOut size={22} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
          <div className='bg-[#181818] border border-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative'>
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setDeletePass({ password: '' })
                setDeleteError('')
              }}
              className='absolute top-4 right-4 text-gray-500 hover:text-white'
            >
              <X size={20} />
            </button>

            <div className='text-center mb-6'>
              <div className='w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <AlertTriangle className='text-red-500 w-8 h-8' />
              </div>
              <h2 className='text-xl font-bold text-white mb-2'>
                Delete Account?
              </h2>
              <p className='text-gray-400 text-sm'>
                To confirm deletion, please enter your password. <br />
                <span className='text-red-400 font-medium'>
                  All data will be lost forever.
                </span>
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className='space-y-4'>
              {deleteError && (
                <div className='flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20'>
                  <AlertTriangle size={14} className='shrink-0' />
                  <span>{deleteError}</span>
                </div>
              )}
              <div className='space-y-1 text-left'>
                <label className='text-xs font-medium text-gray-400 uppercase'>
                  Confirm Password
                </label>
                <input
                  type='password'
                  value={deletePass.password}
                  onChange={e => setDeletePass({ password: e.target.value })}
                  className='w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-500
                   focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors'
                  placeholder='Your password'
                  required
                />
              </div>

              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletePass({ password: '' })
                    setDeleteError('')
                  }}
                  className='flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-semibold hover:bg-gray-700 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={deleting}
                  className='flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50
                   disabled:cursor-not-allowed transition shadow-lg shadow-red-900/20'
                >
                  {deleting ? 'Deleting....' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
