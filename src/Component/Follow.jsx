import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function FollowButton({ targetUserId, initialIsFollowing = false, size = "sm" }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async (e) => {
    e.stopPropagation(); // agar card ke andar click hai toh parent onClick trigger na ho
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(
        `${API_BASE}/api/users/follow/${targetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setIsFollowing(res.data.isFollowing);
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === "sm" ? "text-xs px-3 py-1" : "text-sm px-4 py-1.5";

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`${sizeClasses} rounded-lg font-semibold transition-all disabled:opacity-50 ${
        isFollowing
          ? "bg-zinc-800 text-white hover:bg-red-600"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export default FollowButton;