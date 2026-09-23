import { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCloudArrowUp, faFilm } from "@fortawesome/free-solid-svg-icons";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(""); // 'image' or 'video'
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  //  Helper function to validate and set file
  const processFile = (file) => {
    if (!file) return;

    // Extension & MIME Type Check (Both Browser & File Extension)
    const ext = file.name.split(".").pop().toLowerCase();
    const isVideo = file.type.startsWith("video/") || ["mp4", "mov"].includes(ext);
    const isImage = file.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(ext);

    if (!isVideo && !isImage) {
      alert("Please select a supported file (JPG, PNG, WEBP, MP4, MOV)");
      return;
    }

    setMediaFile(file);
    setMediaType(isVideo ? "video" : "image");
    setPreview(URL.createObjectURL(file));
  };

  // 📁 File Select Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = ""; // Reset input so same file can be re-selected if needed
  };

  // 🖐️ Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Reset Form
  const resetMedia = () => {
    setMediaFile(null);
    setMediaType("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleClose = () => {
    setCaption("");
    resetMedia();
    onClose();
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mediaFile) return alert("Please select an image or video.");

    setLoading(true);

    const formData = new FormData();

    formData.append("caption", caption);
    formData.append("file", mediaFile);
    formData.append("mediaType", mediaType);
    console.log("uploading:",{
       name: mediaFile.name,
    type: mediaFile.type,
    size: mediaFile.size,
    mediaType,
    caption,
    });
    

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_BASE}/api/posts/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          
        },
      });
      console.log("upload response:", res.data);
      
      if (res.data.success) {
        onPostCreated(res.data.post);
        handleClose();
      } else {
      alert(res.data.message || "Failed to create post");
    }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-bold text-lg">Create Reel / Post</h3>
          <button onClick={handleClose} className="text-zinc-400 hover:text-white">
            <FontAwesomeIcon icon={faXmark} className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          {/* Upload & Drag-Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-72 border-2 border-dashed rounded-xl flex flex-col items-center justify-center overflow-hidden relative transition-all bg-zinc-950 ${
              isDragging ? "border-blue-500 bg-blue-500/10" : "border-zinc-700"
            }`}
          >
            {preview ? (
              <>
                {/* Media Preview (Video vs Image) */}
                {mediaType === "video" ? (
                  <video
                    src={preview}
                    controls
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Selected Upload"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Selected File Badge */}
                <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded-md text-xs flex items-center gap-2 border border-zinc-700">
                  <FontAwesomeIcon icon={mediaType === "video" ? faFilm : faCloudArrowUp} />
                  <span className="truncate max-w-[200px]">{mediaFile?.name}</span>
                </div>

                {/* Remove Selected File Button */}
                <button
                  type="button"
                  onClick={resetMedia}
                  className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-4 text-center">
                <FontAwesomeIcon icon={faCloudArrowUp} className="text-4xl text-blue-500 mb-3" />
                <span className="text-sm font-semibold text-zinc-300">
                  Upload an image or short video clip
                </span>
                <span className="text-xs text-zinc-500 mt-2">
                  Supported: JPG, PNG, WEBP, MP4, MOV
                </span>
                
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,.mp4,.mov,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Caption */}
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !mediaFile}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all"
          >
            {loading ? "Uploading..." : "Share"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;