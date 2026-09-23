import { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "../Component/PostCard";
import CreatePostModal from "../Component/CreatePostModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/posts/feed`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success) {
          setPosts(res.data.posts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // When new post is created
  const handlePostCreated = (newPost) => {
    setPosts((currentPosts) => [newPost, ...currentPosts]);
  };

  return (
    <div className="py-6 flex flex-col items-center min-h-screen">
      
      {/* ➕ Create Post Button */}
      <div className="w-full max-w-[470px] mb-6 flex justify-between items-center px-2">
        <h2 className="text-lg font-bold text-white">Feeds</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Post
        </button>
      </div>

      {/* Feed Area */}
      {loading ? (
        <div className="text-zinc-500 text-sm mt-10">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-zinc-500 text-sm mt-10">No posts yet. Be the first to post!</div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post._id}
            post={{
              id: post._id,
              username: post.user?.username || post.user?.name || "User",
              userAvatar: post.user?.avatar || "https://via.placeholder.com/150",
              mediaUrl: post.media || post.image,
              mediaType: post.mediaType || "image",
              likes: post.likes?.length || 0,
              caption: post.caption,
              timeAgo: new Date(post.createdAt).toLocaleDateString(),
              commentsList: post.comments || [],
            }}
          />
        ))
      )}

      {/* Upload Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Home;  