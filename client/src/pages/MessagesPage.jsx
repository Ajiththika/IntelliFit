import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../services/api';
import ChatWindow from '../components/messages/ChatWindow';
import ConversationList from '../components/messages/ConversationList';
import { Loader2 } from 'lucide-react';

const MessagesPage = () => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await API.get('/messages/conversations');
                setConversations(data);

                // Handle routing from Profile/Order (passing recipient/order via state)
                const state = location.state;
                if (state && state.startConversation) {
                    // Check if exists
                    const existing = data.find(c =>
                        c.participants.some(p => p._id === state.recipientId) &&
                        (state.orderId ? c.orderId?._id === state.orderId : true) // Loose match on order?
                    );

                    if (existing) {
                        setActiveConversation(existing);
                    } else {
                        // Create new
                        const { data: newConv } = await API.post('/messages/conversation', {
                            recipientId: state.recipientId,
                            orderId: state.orderId
                        });
                        setConversations(prev => [newConv, ...prev]);
                        setActiveConversation(newConv);
                    }
                    // Clear state to prevent loop logic? React router state persists, but useEffect deps handle it.
                    // Actually, safer to just rely on initial mount.
                }

            } catch (error) {
                console.error("Failed to fetch conversations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [location.state]); // Re-run if navigating with new state

    return (
        <div className="h-[calc(100vh-4rem)] flex bg-background">
            {/* Sidebar List - Hidden on mobile if active conversation */}
            <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col bg-card
                ${activeConversation ? 'hidden md:flex' : 'flex'}
            `}>
                <div className="p-4 border-b font-bold text-xl flex items-center justify-between">
                    Messages
                    {/* Optional: New Chat Button */}
                </div>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                ) : (
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversation?._id}
                        onSelect={setActiveConversation}
                    />
                )}
            </div>

            {/* Chat Window - Full width on mobile if active */}
            <div className={`flex-1 flex flex-col
                 ${!activeConversation ? 'hidden md:flex' : 'flex'}
            `}>
                {activeConversation ? (
                    <ChatWindow
                        conversation={activeConversation}
                        onBack={() => setActiveConversation(null)}
                    />
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground bg-muted/20">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                            <p className="max-w-xs mx-auto text-sm">Choose from your existing messages or start a new chat from a tailor's profile.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
