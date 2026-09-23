


import { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import axios from "axios";

// const BACKEND_URL = 'http://localhost:5000';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_BASE, { autoConnect: true });

const authHeaders = () => ({
  headers : {Authorization: `Bearer ${localStorage.getItem("token")}` },
})

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

function Chat() {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");
 
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);
  const openRequestRef = useRef(0);
  const sendingRef = useRef(false);

  const [currentUser] = useState(() => {
        try {
      const raw = localStorage.getItem("guser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const myId = currentUser?._id;


 

  // Keep ref synchronized with current selected user
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch users list
  useEffect(() => {
    if(!localStorage.getItem("token")) return;
    
    axios.get(`${API_BASE}/api/users`,  authHeaders())
    .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
    .catch((error) =>{
      console.error("Error fetching users:", error);
      setError("Could not load users.");

    });
    
    }, []);
    
    

  // Socket Connection & Real-time Handlers
  useEffect(() => {
    const handleOnlineUsers = (online) => setOnlineUsers(online);
        const handleReceiveMessage = (data) => {
      const open = selectedUserRef.current;

      if (open && open._id === data.sender) {
        setMessages((prev) => {
          if (data._id && prev.some((m) => m._id === data._id)) return prev; // no duplicates
          return [
            ...prev,
            {
              message: data.message,
              sender: data.sender,
              type: "received",
              createdAt: data.createdAt || new Date().toISOString(),
              _id: data._id || Date.now(),
            },
          ];
        });
        socket.emit("markAsSeen", { senderId: data.sender, receiverId: myId });
      } else {
        // message from someone whose chat is not open -> unread badge
        setUnread((prev) => ({ ...prev, [data.sender]: (prev[data.sender] || 0) + 1 }));
      }
    };

   // Real-time listener: Jab receiver message dekh le
    const handleMessagesMarkedAsSeen = ({ receiverId }) => {
       const open = selectedUserRef.current;
      if (open && open._id === receiverId) {
        setMessages((prev) =>
          prev.map((m) => (m.type === "sent" ? { ...m, isSeen: true } : m))
        );
      }
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messagesMarkedAsSeen", handleMessagesMarkedAsSeen);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messagesMarkedAsSeen", handleMessagesMarkedAsSeen);
    };
  }, [myId]);

  // Fetch Chat History
  const openChat = async (u) => {
    const requestId = ++openRequestRef.current;
    setSelectedUser(u);
    setMessages([]);
    setError("");
    setLoadingHistory(true);
    setUnread((prev) => {
      if (!prev[u._id]) return prev;
      const next = { ...prev };
      delete next[u._id];
      return next;
    });

    try {
      const res = await axios.get(`${API_BASE}/api/message/chat/${u._id}`, authHeaders());
      if (requestId !== openRequestRef.current) return; // user already switched chats

      setMessages(
        res.data.map((m) => ({
          ...m,
          type: m.sender === myId ? "sent" : "received",
        }))
      );
      socket.emit("markAsSeen", { senderId: u._id, receiverId: myId });
    } catch (err) {
      if (requestId !== openRequestRef.current) return;
      console.error("Error fetching chat history:", err);
      setError("Could not load messages. Please try again.");
    } finally {
      if (requestId === openRequestRef.current) setLoadingHistory(false);
    }
  };

  
 // Send Message
 const send = async () => {
    const text = msg.trim();
    if (!text || !selectedUser || sendingRef.current) return;

    sendingRef.current = true;
    setMsg("");
    setError("");

    try {
      const res = await axios.post(
        `${API_BASE}/api/message/send`,
        { receiverId: selectedUser._id, message: text },
        authHeaders()
      );
      const saved = res.data;
      const createdAt = saved?.createdAt || new Date().toISOString();


      // FIX 1: Declare savedMsg from res.data
      // const savedMsg = res.data;

      // Emit Real-time Socket Event
     socket.emit("privateMessage", {
        sender: myId,
        receiver: selectedUser._id,
        message: text,
        _id: saved?._id,
        createdAt,
      });

      setMessages((prev) => [
        ...prev,
        {
          message: text,
          sender: myId,
          type: "sent",
          isSeen: false,
          createdAt,
          _id: saved?._id || Date.now(),
        },
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
      setMsg(text); // give the text back so nothing is lost
      setError(err.response?.data?.error || "Message could not be sent. Please try again.");
    } finally {
      sendingRef.current = false;
    }
  };


 
  // return (
  //   <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased">
  //     {/* Sidebar */}
  //     <div className="w-80 border-r border-slate-200 bg-white flex flex-col shadow-xs">
  //       <div className="p-4 border-b border-slate-100 flex items-center justify-between">
  //         <div>
  //           <h2 className="text-lg font-bold text-slate-800">Messages</h2>
  //           <p className="text-xs text-slate-500">
  //             Active:{" "} <span className="font-medium text-emerald-600">{currentUser?.username || currentUser?.name || 'Me'}</span>
  //           </p>
  //         </div>
  //       </div>

  //       <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
  //         {users.length === 0 && (
  //           <p className="p-6 text-center text-sm text-slate-400">No users to chat with yet.</p>
  //         )}

  //         {users.map((u) => {
  //           const isOnline = onlineUsers.includes(u._id);
  //           const isSelected = selectedUser?._id === u._id;
  //           const userName = u.username || u.name || "User";

  //           return (
  //             <div 
  //               key={u._id}
  //               onClick={() => openChat(u)}
  //               className={`flex items-center gap-3 p-3.5 cursor-pointer transition-all duration-150 ${
  //                 isSelected ? "bg-indigo-50/70 border-l-4 border-indigo-600" : "hover:bg-slate-50"
  //               }`}
  //             >
  //               <div className="relative flex-shrink-0">
  //                 <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
  //                   {userName.charAt(0).toUpperCase()}
  //                 </div>
  //                 <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
  //                   isOnline ? "bg-emerald-500" : "bg-slate-300"
  //                 }`} />
  //               </div>

  //               <div className="flex-1 min-w-0">
  //                 <div className="flex items-center justify-between">
  //                   <p className="font-semibold text-slate-800 truncate text-sm">{userName}</p>
  //                   <span className="text-[11px] text-slate-400">
  //                     {isOnline ? "Online" : "Offline"}
  //                   </span>
  //                 </div>
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>
  //     </div>

  //     {/* Main Chat Area */}
  //     <div className="flex-1 flex flex-col bg-slate-100">
  //       {!selectedUser ? (
  //         <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
  //           <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 text-xl font-semibold">
  //             💬
  //           </div>
  //           <h3 className="text-lg font-bold text-slate-700">No Chat Selected</h3>
  //           <p className="text-sm text-slate-400 max-w-xs mt-1">
  //             Select a user from the left panel to start chatting.
  //           </p>
  //         </div>
  //       ) : (
  //         <>
  //           {/* Header */}
  //           <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
  //             <div className="flex items-center gap-3">
  //               <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
  //                 {(selectedUser.username || selectedUser.name || "U").charAt(0).toUpperCase()}
  //               </div>
  //               <div>
  //                 <h3 className="font-bold text-slate-800 text-sm">
  //                   {selectedUser.username || selectedUser.name}
  //                 </h3>
  //                 <p className="text-[11px] text-slate-400">
  //                   {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
  //                 </p>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Messages Box */}
  //           <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#f8fafc]">
  //             {messages.map((m, i) => {
  //               const isSent = m.type === "sent";
  //               return (
  //                 <div
  //                   key={m._id || i}
  //                   className={`flex ${isSent ? "justify-end" : "justify-start"}`}
  //                 >
  //                   <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
  //                     isSent 
  //                       ? "bg-indigo-600 text-white rounded-br-none shadow-xs" 
  //                       : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs"
  //                   }`}>
  //                    <div> {m.message}</div>

  //                   {/* Timestamp & Status Ticks */}
  //                     <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
  //                       isSent ? "text-indigo-200" : "text-slate-400"
  //                     }`}>
  //                       <span>{formatTime(m.createdAt)}</span>
  //                       {isSent && (
  //                         <span className="font-bold text-xs leading-none">
  //                           {m.isSeen ? (
  //                             <span className="text-sky-300">✓✓</span> /* Blue Ticks for Seen */
  //                           ) : (
  //                             <span className="text-indigo-300/70">✓✓</span> /* Grey Ticks for Unseen */
  //                           )}
  //                         </span>
  //                       )}
  //                     </div>
  //                   </div>
  //                 </div>
  //               );
  //             })}
  //             <div ref={messagesEndRef} />
  //           </div>

  //           {/* Input Box */}
  //           <div className="p-4 bg-white border-t border-slate-200">
  //             <div className="flex items-center gap-2 max-w-4xl mx-auto">
  //               <input 
  //                 value={msg}
  //                 onChange={(e) => setMsg(e.target.value)}
  //                 onKeyDown={(e) => e.key === 'Enter' && send()}
  //                 placeholder="Type your message..."
  //                 className="flex-1 bg-slate-100 text-slate-200 border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all duration-150" 
  //               />
  //               <button
  //                 onClick={send}
  //                 disabled={!msg.trim()}
  //                 className="bg-indigo-600 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors duration-150 shadow-xs"
  //               >
  //                 Send
  //               </button>
  //             </div>
  //           </div>
  //         </>
  //       )}
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex h-full bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Sidebar: full width on phones (hidden once a chat is open), fixed width on md+ */}
      <div
        className={`${
          selectedUser ? "hidden" : "flex"
        } md:flex w-full md:w-80 shrink-0 border-r border-slate-200 bg-white flex-col shadow-xs`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Messages</h2>
            <p className="text-xs text-slate-500">
              Active:{" "}
              <span className="font-medium text-emerald-600">
                {currentUser?.username || currentUser?.name || "Me"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {users.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">No users to chat with yet.</p>
          )}

          {users.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            const isSelected = selectedUser?._id === u._id;
            const userName = u.username || u.name || "User";
            const unreadCount = unread[u._id] || 0;

            return (
              <div
                key={u._id}
                onClick={() => openChat(u)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-indigo-50/70 border-l-4 border-indigo-600"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      isOnline ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`truncate text-sm text-slate-800 ${
                      unreadCount ? "font-bold" : "font-semibold"
                    }`}
                  >
                    {userName}
                  </p>
                  <p className="text-[11px] text-slate-400">{isOnline ? "Online" : "Offline"}</p>
                </div>

                {unreadCount > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-semibold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversation: hidden on phones until a user is selected */}
      <div
        className={`${
          selectedUser ? "flex" : "hidden"
        } md:flex flex-1 min-w-0 min-h-0 flex-col bg-slate-100`}
      >
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 text-xl font-semibold">
              💬
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Chat Selected</h3>
            <p className="text-sm text-slate-400 max-w-xs mt-1">
              Select a user from the left panel to start chatting.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-16 shrink-0 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedUser(null)}
                  aria-label="Back to chats"
                  className="md:hidden -ml-1 px-2 py-1 text-xl text-slate-500 hover:text-slate-800"
                >
                  ←
                </button>
                <div className="w-9 h-9 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {(selectedUser.username || selectedUser.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate">
                    {selectedUser.username || selectedUser.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {onlineUsers.includes(selectedUser._id) ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-3 bg-[#f8fafc]">
              {loadingHistory && (
                <p className="text-center text-xs text-slate-400">Loading messages…</p>
              )}
              {!loadingHistory && messages.length === 0 && !error && (
                <p className="text-center text-xs text-slate-400">
                  No messages yet. Say hi 👋
                </p>
              )}

              {messages.map((m, i) => {
                const isSent = m.type === "sent";
                return (
                  <div
                    key={m._id || i}
                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[65%] break-words px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isSent
                          ? "bg-indigo-600 text-white rounded-br-none shadow-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs"
                      }`}
                    >
                      <div>{m.message}</div>

                      {/* Time + status ticks */}
                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                          isSent ? "text-indigo-200" : "text-slate-400"
                        }`}
                      >
                        <span>{formatTime(m.createdAt)}</span>
                        {isSent && (
                          <span className="font-bold text-xs leading-none">
                            {m.isSeen ? (
                              <span className="text-sky-300">✓✓</span>
                            ) : (
                              <span className="text-indigo-300/70">✓✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Error banner */}
            {error && (
              <div className="shrink-0 px-4 py-2 bg-red-50 border-t border-red-100 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 p-3 md:p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 max-w-4xl mx-auto">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) send();
                  }}
                  placeholder="Type your message..."
                  className="flex-1 min-w-0 bg-slate-100 text-slate-800 placeholder:text-slate-400 border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-white focus:border-indigo-500 transition-all duration-150"
                />
                <button
                  onClick={send}
                  disabled={!msg.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors duration-150 shadow-xs"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Chat;