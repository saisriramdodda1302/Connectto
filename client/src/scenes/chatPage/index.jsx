import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import NavBar from "scenes/navbar";
import UserImage from "components/UserImage";
import { io } from "socket.io-client";
import { Send, MessageSquare } from "lucide-react";
import axios from "axios";

const ChatPage = () => {
    const user = useSelector((state) => state.value.user);
    const token = useSelector((state) => state.value.token);
    const friends = user?.friends || [];
    
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

    // Initial Socket connection
    useEffect(() => {
        const newSocket = io(backendUrl);
        setSocket(newSocket);
        
        newSocket.on("connect", () => {
            newSocket.emit("addUser", user._id);
        });

        return () => newSocket.close();
    }, [user._id, backendUrl]);

    // Handle receiving messages
    useEffect(() => {
        if (!socket) return;
        
        socket.on("receiveMessage", (message) => {
            // Only push to local state if the message corresponds to the currently opened chat
            if (
                selectedFriend && 
                (message.sender_id === selectedFriend._id || message.sender_id === user._id)
            ) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => socket.off("receiveMessage");
    }, [socket, selectedFriend, user._id]);

    // Fetch message history when selectedFriend changes
    useEffect(() => {
        const getMessages = async () => {
            if (!selectedFriend) return;
            try {
                const res = await axios.get(`${backendUrl}/messages/${user._id}/${selectedFriend._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
            } catch (err) {
                console.error("Error fetching messages", err);
            }
        };
        getMessages();
    }, [selectedFriend, user._id, token, backendUrl]);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || !selectedFriend) return;

        const newMessage = {
            senderId: user._id,
            receiverId: selectedFriend._id,
            content: inputText,
            created_at: new Date().toISOString()
        };

        // Emit through socket
        socket.emit("sendMessage", newMessage);

        // Update local state optimistic UI
        setMessages((prev) => [...prev, {
            sender_id: newMessage.senderId,
            receiver_id: newMessage.receiverId,
            content: newMessage.content,
            created_at: newMessage.created_at
        }]);
        setInputText("");

        // Persist to DB
        try {
            await axios.post(`${backendUrl}/messages`, newMessage, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Error sending message to DB", err);
        }
    };

    const chatList = [
        { ...user, isYou: true },
        ...friends
    ];

    return (
        <div className="h-screen flex flex-col bg-[#f6f6f6] dark:bg-neutral-900 transition-colors duration-300">
            <NavBar />
            
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-80 bg-white dark:bg-[#1A1A1A] border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-colors duration-300 flex-shrink-0 relative">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                        <h2 className="text-xl font-bold dark:text-gray-100">Messages</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {chatList.map((friend) => (
                            <div 
                                key={friend._id}
                                onClick={() => setSelectedFriend(friend)}
                                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                                    selectedFriend?._id === friend._id ? "bg-neutral-100 dark:bg-neutral-800" : ""
                                }`}
                            >
                                <UserImage image={friend.picturepath || friend.picturePath} size="45px" />
                                <div>
                                    <h3 className="font-semibold text-neutral-800 dark:text-gray-200">
                                        {friend.firstname || friend.firstName} {friend.lastname || friend.lastName}
                                        {friend.isYou && " (You)"}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`flex-1 flex flex-col bg-white dark:bg-neutral-900 transition-colors duration-300 ${!selectedFriend ? 'hidden md:flex' : 'flex'} absolute md:relative w-full h-full md:w-auto left-0 top-0`}>
                    {selectedFriend ? (
                        <div className="flex flex-col h-full bg-white dark:bg-neutral-900 z-10 w-full pt-[73px] md:pt-0">
                            {/* Mobile Back Button built-in to Header conceptually or just a basic sticky header */}
                            <div className="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shrink-0 shadow-sm z-20">
                                <button className="md:hidden p-2 mr-2 bg-neutral-100 rounded-full dark:bg-neutral-800" onClick={() => setSelectedFriend(null)}>🔙</button>
                                <UserImage image={selectedFriend.picturepath || selectedFriend.picturePath} size="45px" />
                                <div>
                                    <h3 className="font-bold text-lg dark:text-gray-100">
                                        {selectedFriend.firstname || selectedFriend.firstName} {selectedFriend.lastname || selectedFriend.lastName}
                                        {selectedFriend.isYou && " (You)"}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, idx) => {
                                    const isOwnMessage = msg.sender_id === user._id;
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                        >
                                            <div 
                                                className={`max-w-[70%] p-3 rounded-2xl ${
                                                    isOwnMessage 
                                                        ? "bg-blue-500 text-white rounded-br-none" 
                                                        : "bg-neutral-200 dark:bg-neutral-800 dark:text-gray-100 text-neutral-800 rounded-bl-none"
                                                }`}
                                            >
                                                <p>{msg.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-900 pb-24 md:pb-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSendMessage();
                                        }}
                                        placeholder="Message..."
                                        className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-gray-100 rounded-full px-6 py-3 outline-none border border-transparent focus:border-blue-500 transition-colors"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!inputText.trim()}
                                        className="p-3 rounded-full bg-blue-500 text-white disabled:opacity-50 hover:bg-blue-600 transition"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-neutral-500 dark:text-neutral-400 bg-[#f6f6f6] dark:bg-neutral-900">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
                                <p>Select a friend or yourself to send a message.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
