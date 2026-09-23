import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHeart as faHeartSolid, 
  faBookmark as faBookmarkSolid 
} from "@fortawesome/free-solid-svg-icons";
import { 
  faHeart as faHeartRegular, 
  faComment, 
  faPaperPlane, 
  faBookmark as faBookmarkRegular,
  faEllipsis,
  faSmile
} from "@fortawesome/free-solid-svg-icons";

function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post?.commentsList || []);

  const mediaUrl = post?.mediaUrl || post?.postImage || "https://via.placeholder.com/600x600";
  const mediaType = post?.mediaType || "image";

  // Like Toggle Function
  const handleLike = () => {
    if (isLiked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  // Add Comment Function
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setComments([...comments, { username: "You", text: commentText.trim() }]);
    setCommentText("");
  };

  return (
    <div className="max-w-[470px] mx-auto bg-zinc-900 text-white border border-zinc-800 rounded-xl mb-6 overflow-hidden">
      
      {/* 1. POST HEADER (User Info) */}
      <div className="flex items-center justify-between p-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600">
            <img
              src={post?.userAvatar || "https://via.placeholder.com/150"}
              alt="user avatar"
              className="w-full h-full object-cover rounded-full border border-black"
            />
          </div>
          <div>
            <h4 className="font-semibold text-sm leading-none hover:underline cursor-pointer">
              {post?.username || "user_name"}
            </h4>
            {post?.location && (
              <span className="text-[11px] text-zinc-400">{post.location}</span>
            )}
          </div>
        </div>
        <button className="text-zinc-400 hover:text-white transition-colors">
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>

      {/* 2. POST MEDIA */}
      <div 
        className="w-full bg-black flex items-center justify-center select-none cursor-pointer"
        onDoubleClick={handleLike}
      >
        {mediaType === "video" ? (
          <video
            src={mediaUrl}
            controls
            className="w-full max-h-[550px] object-cover"
          />
        ) : (
          <img
            src={mediaUrl}
            alt="post content"
            className="w-full max-h-[550px] object-cover"
          />
        )}
      </div>

      {/* 3. ACTION BUTTONS (Like, Comment, Share, Save) */}
      <div className="p-3.5 pb-2">
        <div className="flex items-center justify-between mb-3 text-xl">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`transition-transform active:scale-125 ${
                isLiked ? "text-red-500" : "text-white hover:text-zinc-400"
              }`}
            >
              <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} />
            </button>

            {/* Comment Button */}
            <button className="text-white hover:text-zinc-400 transition-colors">
              <FontAwesomeIcon icon={faComment} />
            </button>

            {/* Share Button */}
            <button className="text-white hover:text-zinc-400 transition-colors">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="text-white hover:text-zinc-400 transition-colors"
          >
            <FontAwesomeIcon icon={isBookmarked ? faBookmarkSolid : faBookmarkRegular} />
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-sm mb-1">
          {likeCount.toLocaleString()} likes
        </p>

        {/* Caption Section */}
        {post?.caption && (
          <div className="text-sm mb-2">
            <span className="font-semibold mr-2">{post.username}</span>
            <span className="text-zinc-300">{post.caption}</span>
          </div>
        )}

        {/* Comments Preview */}
        {comments.length > 0 && (
          <div className="space-y-1 my-2">
            {comments.slice(-2).map((c, i) => (
              <p key={i} className="text-xs text-zinc-300">
                <span className="font-semibold text-white mr-1.5">
                  {c.username || c.user?.username || "User"}
                </span>
                {c.text}
              </p>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
          {post?.timeAgo || "2 hours ago"}
        </span>
      </div>

      {/* 4. ADD COMMENT INPUT */}
      <form 
        onSubmit={handleAddComment}
        className="flex items-center justify-between px-3.5 py-3 border-t border-zinc-800 text-sm"
      >
        <div className="flex items-center gap-3 flex-1">
          <button type="button" className="text-zinc-400 hover:text-white">
            <FontAwesomeIcon icon={faSmile} />
          </button>
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none text-xs"
          />
        </div>
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="text-blue-500 font-semibold text-xs hover:text-white disabled:opacity-40 disabled:cursor-not-allowed ml-2"
        >
          Post
        </button>
      </form>

    </div>
  );
}

export default PostCard;