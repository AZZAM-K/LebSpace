import React, { useContext, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/context";
import { UploadCloud, Image, Video, X } from "lucide-react"; 

export default function AddStory() {
  const navigate = useNavigate();
  const context = useContext(AppContext);
  const addStory = context?.addStory; 

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); 

  const mediaType = useMemo(() => {
    if (!file) return null;
    return file.type.startsWith("video") ? "video" : "image";
  }, [file]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !addStory) return;

    const formData = new FormData();
    formData.append("media", file);
    formData.append("contentType", mediaType);
    formData.append("durationInHours", 24);

    setLoading(true);
    const res = await addStory(formData);
    setLoading(false);

    if (res?.success) {
      navigate("/");
    } else {
      console.error(res?.message);
      alert(res?.message || "Failed to add story. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null); 
    document.getElementById('file-upload').value = '';
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-950 text-white p-4'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-lg bg-neutral-900 p-6 sm:p-8 rounded-3xl space-y-8 shadow-2xl shadow-black/70 transition-all duration-500 transform hover:shadow-orange-600/10' 
      >
        <h1 className='text-3xl font-extrabold text-center bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-red-500 pb-1 border-b border-neutral-700/50'>
          Upload Your Story
        </h1>

        <div className="relative border-2 border-dashed border-neutral-700 rounded-3xl p-6 transition-colors duration-300 hover:border-orange-500/80 group">
          
          <input
            type='file'
            id="file-upload"
            accept='image/*,video/*'
            onChange={handleFileChange}
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
            disabled={loading}
          />
          
          {file ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-neutral-800 flex items-center justify-center border-2 border-orange-500/50 p-0.5">
                <div className="w-full h-full rounded-xl overflow-hidden bg-neutral-700 flex items-center justify-center">
                  {previewUrl && (mediaType === 'image' ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={previewUrl} controls={false} muted className="w-full h-full object-cover" />
                  ))}
                  {!previewUrl && (
                      <span className="text-neutral-400 text-sm">No Preview</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-base text-neutral-200">
                {mediaType === 'video' ? <Video size={20} className="text-red-400" /> : <Image size={20} className="text-green-400" />} 
                <span className="truncate max-w-[200px] font-medium">{file.name}</span>
              </div>
              
              <button 
                type="button" 
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-400 transition flex items-center space-x-1 text-sm font-medium"
              >
                <X size={16} /> <span>Remove File</span> 
              </button>
            </div>
          ) : (
            <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center justify-center h-48 space-y-3 text-neutral-500 cursor-pointer"
            >
              <UploadCloud size={48} className="text-orange-500 group-hover:text-orange-400 transition duration-300" />
              <p className="text-lg font-medium text-white">Tap to Select Media</p>
              <p className="text-sm">Image or Video up to 24h</p>
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className={`
            w-full py-3 rounded-xl transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-2
            ${
              loading || !file
                ? "bg-neutral-700 text-neutral-400 cursor-not-allowed opacity-70"
                : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/50 active:scale-[0.98] transform"
            }
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Uploading...</span>
            </>
          ) : (
            <span>Add Story</span>
          )}
        </button>
      </form>
    </div>
  );
}