// AddPostMobile.jsx (FIXED file input ref issue)
import React, { useEffect, useState, useRef, useContext } from "react"
import { AppContext } from "../Context/context"
import { useNavigate } from "react-router"

const IconBack = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
  >
    <path
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15 19l-7-7 7-7'
    />
  </svg>
)
const IconNext = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
  >
    <path
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 5l7 7-7 7'
    />
  </svg>
)
const IconTrash = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
  >
    <path
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 11v6M14 11v6'
    />
  </svg>
)
const IconChange = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
  >
    <path
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
    />
  </svg>
)

const AddPostMobile = ({ onClose }) => {
  const { addPost } = useContext(AppContext)

  const fileRef = useRef(null)
  const [step, setStep] = useState(1)
  const [contentType, setContentType] = useState("image")
  const [mediaFile, setMediaFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState("")
  const [hashtags, setHashtags] = useState([])
  const [tagInput, setTagInput] = useState("")
  const [hashtagInput, setHashtagInput] = useState("")
  const [taggedUsers, setTaggedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    if (!mediaFile) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(mediaFile)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [mediaFile])

  const handleFile = file => {
    if (!file) return
    const type = file.type.startsWith("video") ? "video" : "image"
    setContentType(type)
    setMediaFile(file)
    setStep(1)
  }

  const onFileChange = e => {
    const f = e.target.files?.[0]
    handleFile(f)
    e.target.value = ""
  }

  const openFileDialog = () => {
    fileRef.current?.click()
  }

  const removeMedia = () => {
    setMediaFile(null)
    setPreview(null)
  }

  const addHashtag = () => {
    const val = hashtagInput.trim()
    if (!val) return
    const cleaned = val.replace(/^#/, "")
    if (!hashtags.includes(cleaned)) {
      setHashtags(prev => [...prev, cleaned])
      setHashtagInput("")
    } else setHashtagInput("")
  }

  const removeHashtag = t => setHashtags(prev => prev.filter(x => x !== t))

  const addTaggedUser = () => {
    const val = tagInput.trim()
    if (!val) return
    const cleaned = val.replace(/^@/, "")
    if (!taggedUsers.includes(cleaned)) {
      setTaggedUsers(prev => [...prev, cleaned])
      setTagInput("")
    } else setTagInput("")
  }

  const removeTaggedUser = u =>
    setTaggedUsers(prev => prev.filter(x => x !== u))

  const nextStep = () => {
    if (step === 1) {
      if (!mediaFile && contentType !== "text") {
        setMessage("Please select an image or video first.")
        return
      }
      setMessage("")
      setStep(2)
    } else {
      setStep(2)
    }
  }

  const navigate = useNavigate()

  const prevStep = () => {
    if (step === 2) {
      setStep(1) 
    } else if (step === 1) {
      navigate("/") 
    } else {
      onClose && onClose()
    }
  }

  const handleSubmit = async () => {
    if (!mediaFile && contentType !== "text") {
      setMessage("Please add media or switch to text type.")
      return
    }
    setLoading(true)
    setMessage("")
    try {
      const form = new FormData()
      form.append("contentType", contentType)
      if (mediaFile) form.append("media", mediaFile)
      form.append("caption", caption)
      form.append("hashtags", JSON.stringify(hashtags))
      form.append("taggedUsers", JSON.stringify(taggedUsers))
      const result = await addPost(form)
      setLoading(false)
      if (result?.success) {
        setMessage("Posted successfully!")
        setMediaFile(null)
        setPreview(null)
        setCaption("")
        setHashtags([])
        setTaggedUsers([])
        setStep(1)
        setTimeout(() => onClose && onClose(), 700)
      } else {
        setMessage(result?.message || "Failed to post.")
      }
    } catch (err) {
      setLoading(false)
      setMessage("Error uploading post.")
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black text-white flex flex-col'>
      <input
        ref={fileRef}
        type='file'
        accept='image/*,video/*'
        onChange={onFileChange}
        className='hidden'
      />

      <div className='flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-black/90'>
        <button
          onClick={prevStep}
          className='p-2 rounded-full hover:bg-white/5 transition'
          aria-label='Back'
        >
          <IconBack />
        </button>

        <div className='flex items-center gap-2'>
          <div className='text-sm text-gray-300/80'>
            {step === 1 ? "Preview" : "Create"}
          </div>
        </div>

        <button
          onClick={nextStep}
          className='text-sm text-orange-400 font-semibold px-3 py-1 rounded-md hover:bg-white/5 transition disabled:opacity-40'
          disabled={step === 2 && loading}
        >
          {step === 1 ? "Next" : "Next"}
        </button>
      </div>

      <div className='flex-1 overflow-auto'>
        {step === 1 && (
          <div className='w-full h-full flex flex-col items-center justify-start'>
            <div className='w-full max-w-md mx-auto h-[60vh] mt-4 relative'>
              {!preview ? (
                <div className='w-full h-full rounded-lg border border-dashed border-gray-700 bg-linear-to-b from-black/40 to-black/60 flex flex-col items-center justify-center gap-4 p-6'>
                  <div className='text-center'>
                    <div className='mb-3 text-2xl font-bold'>
                      Add Photo or Video
                    </div>
                    <div className='text-sm text-gray-400'>
                      Share a photo or short video
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <button
                      onClick={openFileDialog}
                      className='bg-orange-500 text-black font-semibold px-4 py-2 rounded-lg'
                    >
                      Select
                    </button>

                    <button
                      onClick={() => {
                        setContentType("text")
                        setStep(2)
                      }}
                      className='bg-white/5 text-white px-4 py-2 rounded-lg'
                    >
                      Create Text Post
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {contentType === "image" ? (
                    <img
                      src={preview}
                      alt='preview'
                      className='w-full h-full object-contain rounded-lg bg-black'
                    />
                  ) : (
                    <video
                      src={preview}
                      className='w-full h-full object-contain rounded-lg bg-black'
                      controls
                    />
                  )}

                  <div className='absolute top-3 right-3 flex flex-col gap-2'>
                    <button
                      onClick={openFileDialog}
                      title='Change'
                      className='bg-white/6 p-2 rounded-full cursor-pointer hover:bg-white/8 transition'
                    >
                      <IconChange className='w-5 h-5 text-white' />
                    </button>

                    <button
                      onClick={removeMedia}
                      className='bg-white/6 p-2 rounded-full hover:bg-white/8 transition'
                      title='Remove'
                    >
                      <IconTrash className='w-5 h-5 text-white' />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className='max-w-md mx-auto mt-4 px-2 text-center text-xs text-gray-400'>
              Tip: Tap the image to view it full screen (or use Next to
              continue)
            </div>

            {preview && (
              <div className='max-w-md mx-auto mt-3 px-2'>
                <button
                  onClick={() => {
                    const top = document.createElement("div")
                    top.className =
                      "fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                    top.onclick = () => document.body.removeChild(top)
                    const el = document.createElement(
                      contentType === "image" ? "img" : "video"
                    )
                    if (contentType === "image") {
                      el.src = preview
                      el.style.maxWidth = "95%"
                      el.style.maxHeight = "95%"
                      el.style.borderRadius = "10px"
                    } else {
                      el.src = preview
                      el.controls = true
                      el.style.maxWidth = "95%"
                      el.style.maxHeight = "95%"
                      el.style.borderRadius = "10px"
                    }
                    top.appendChild(el)
                    document.body.appendChild(top)
                  }}
                  className='w-full bg-white/5 text-white py-2 rounded-lg'
                >
                  Open Preview
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className='w-full max-w-md mx-auto p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-20 h-20 bg-black rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center'>
                {preview ? (
                  contentType === "image" ? (
                    <img
                      src={preview}
                      alt='mini'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <video
                      src={preview}
                      className='w-full h-full object-cover'
                    />
                  )
                ) : (
                  <div className='text-gray-500 text-sm'>No media</div>
                )}
              </div>

              <div className='flex-1'>
                <textarea
                  rows={4}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder='Write a caption...'
                  className='w-full resize-none bg-transparent text-white placeholder-gray-400 border border-gray-700 rounded-lg p-3 focus:outline-none'
                />
              </div>
            </div>

            <div className='mt-4'>
              <div className='flex gap-2'>
                <input
                  value={hashtagInput}
                  onChange={e => setHashtagInput(e.target.value)}
                  onKeyDown={e =>
                    e.key === "Enter" && (e.preventDefault(), addHashtag())
                  }
                  placeholder='Add hashtag (press Enter)'
                  className='flex-1 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-gray-700 focus:outline-none'
                />
                <button
                  onClick={addHashtag}
                  className='bg-orange-500 px-4 rounded-lg font-semibold'
                >
                  Add
                </button>
              </div>

              <div className='flex gap-2 flex-wrap mt-3'>
                {hashtags.map(h => (
                  <button
                    key={h}
                    onClick={() => removeHashtag(h)}
                    className='bg-orange-600 text-black px-3 py-1 rounded-full text-sm'
                  >
                    #{h} ✕
                  </button>
                ))}
              </div>
            </div>

            <div className='mt-4'>
              <div className='flex gap-2'>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e =>
                    e.key === "Enter" && (e.preventDefault(), addTaggedUser())
                  }
                  placeholder='Tag user (press Enter)'
                  className='flex-1 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-gray-700 focus:outline-none'
                />
                <button
                  onClick={addTaggedUser}
                  className='bg-yellow-500 px-4 rounded-lg font-semibold'
                >
                  Tag
                </button>
              </div>

              <div className='flex gap-2 flex-wrap mt-3'>
                {taggedUsers.map(u => (
                  <button
                    key={u}
                    onClick={() => removeTaggedUser(u)}
                    className='bg-yellow-600 text-black px-3 py-1 rounded-full text-sm'
                  >
                    @{u} ✕
                  </button>
                ))}
              </div>
            </div>

            <div className='mt-6'>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className='w-full bg-orange-500 text-black font-bold py-3 rounded-lg'
              >
                {loading ? "Posting..." : "Share"}
              </button>
            </div>

            {message && (
              <div className='mt-3 text-center text-sm text-red-400'>
                {message}
              </div>
            )}
          </div>
        )}
      </div>

      <div className='p-3 bg-black/90 border-t border-gray-800'>
        <div className='max-w-md mx-auto text-xs text-center text-gray-400'>
          Your post will be visible to your followers.
        </div>
      </div>
    </div>
  )
}

export default AddPostMobile
