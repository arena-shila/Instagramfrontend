import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHeart, faComment, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../App";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_BASE, { autoConnect: true });


const iconFor = (type) => {
    if(type === "like") return { icon: faHeart, color: "text-red-500"  };
    if (type === "comment") return { icon: faComment, color: "text-blur-400"};
    return { icon : faUserPlus, color: "text-green-400"};
};

const textFor = (n) => {
  const name = n.sender?.username || n.sender?.name || "Someone";
  if (n.type === "follow") return `${name}`;
  if (n.type === "like") return `${name}`;
  if (n.type === "comment") return `${name} "${n.text?.slice(0, 40) || ""}"`;
};

const timeAgo = (dataStr) => {
    const diff = Math.floor((Date.now() - new Date(dataStr)) / 1000);
  if (diff < 60) return "abhi";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};


function NotificationBell() {
  const { guser } = useContext(UserContext);
  const[notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!guser) return;
    const token = localStorage.getItem("token");
    axios.get(`${API_BASE}/api/notification`, {
      headers : {Authorization : `Bearer ${token}`},
    })
    .then((res) => {
      setNotifications(res.data.notification || []);
      setUnreadCount(res.data.unreadCount || 0);
    })
    .catch ((error) => console.error("Notification fetch error", error));
  }, [guser]);

    // real time listener 
    useEffect(() => {
      if (!socket) return;
      const handleNew = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };
      socket.on("newNotification", handleNew);
      return () => socket.off("newNotification", handleNew);
    }, []);

      useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      const token = localStorage.getItem("token");
      try {
        await axios.put(
          `${API_BASE}/api/notification/read-all`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Mark read error:", err);
      }
    }
  };
if (!guser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative text-white hover:text-zinc-300 transition-colors p-2"
      >
        <FontAwesomeIcon icon={faBell} className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute mt-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-[90vw] max-w-sm sm:w-80 max-h-96 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">Koi notification nahi hai</p>
          ) : (
            notifications.map((n) => {
              const { icon, color } = iconFor(n.type);
              return (
                <div
                  key={n._id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 hover:bg-zinc-800/50 transition-colors ${
                    !n.isRead ? "bg-blue-500/5" : ""
                  }`}
                >
                  <img
                    src={n.sender?.avatar || "https://via.placeholder.com/40"}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 leading-snug">{textFor(n)}</p>
                    <span className="text-[10px] text-zinc-500">{timeAgo(n.createdAt)}</span>
                  </div>
                  <FontAwesomeIcon icon={icon} className={`${color} text-sm flex-shrink-0`} />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
