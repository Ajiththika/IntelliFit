import { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/authContext';
import { Send, Image as ImageIcon, Loader2, AlertTriangle, CheckCheck, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const MessageBubble = ({ message, isOwn }) => {
    return (
        <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                {/* Avatar */}
                <div className="flex-shrink-0">
                    {!isOwn && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border">
                            {message.sender?.avatar ? (
                                <img src={message.sender.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-5 h-5 opacity-50" />
                            )}
                        </div>
                    )}
                </div>

                {/* Bubble */}
                <div>
                    <div className={`px-4 py-2 rounded-2xl shadow-sm text-sm break-words
                       ${isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-secondary/50 text-foreground border rounded-bl-none'
                        }
                       ${message.isRedacted ? 'border-red-500/50' : ''}
                   `}>
                        {message.content}
                    </div>

                    {/* Metadata */}
                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-muted-foreground ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isOwn && <CheckCheck className="w-3 h-3 text-primary/60" />}
                    </div>

                    {/* Violation Notice */}
                    {message.isRedacted && (
                        <div className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5 animate-in fade-in">
                            <AlertTriangle className="w-3 h-3" />
                            Content flagged & filtered
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatWindow = ({ conversation, onBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef();

    // Fetch Messages
    useEffect(() => {
        if (!conversation) return;
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const { data } = await API.get(`/messages/${conversation._id}`);
                setMessages(data);
            } catch (error) {
                console.error("Failed to load messages", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();

        // Optional: Polling or Socket logic could go here
    }, [conversation._id]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        // Optimistic UI update could happen here, but we wait for simplicity and filter feedback
        try {
            const { data } = await API.post(`/messages/${conversation._id}/send`, {
                content: newMessage
            });
            setMessages(prev => [...prev, data]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setSending(false);
        }
    };

    // Determine 'Other' participant
    const otherParticipant = conversation.participants.find(p => p._id !== user._id) || conversation.participants[0];

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-card/50 backdrop-blur sticky top-0 z-10">
                {onBack && (
                    <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
                        Back
                    </Button>
                )}

                <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden border flex-shrink-0">
                    {otherParticipant?.avatar ? (
                        <img src={otherParticipant.avatar} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="font-bold text-primary">{otherParticipant?.name?.charAt(0)}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold truncate">{otherParticipant?.name || 'Unknown User'}</h3>
                    {conversation.orderId && (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            Order for {conversation.orderId.garmentType}
                            <span className={`w-1.5 h-1.5 rounded-full ${conversation.orderId.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        </p>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    messages.length > 0 ? (
                        messages.map(msg => (
                            <MessageBubble key={msg._id} message={msg} isOwn={msg.sender._id === user._id} />
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-10 opacity-50">
                            <p>Start the conversation.</p>
                            <p className="text-xs">Safety Tip: Keep payments and sensitive info within IntelliFit.</p>
                        </div>
                    )
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                        <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={sending}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
