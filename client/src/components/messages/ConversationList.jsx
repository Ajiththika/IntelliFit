import { formatDistanceToNow } from 'date-fns';
import { User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/authContext';

const ConversationList = ({ conversations, activeId, onSelect, className }) => {
    const { user } = useAuth();

    if (!conversations || conversations.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground/50 space-y-4 ${className}`}>
                <MessageSquare className="w-12 h-12 opacity-20" />
                <p>No messages yet.</p>
            </div>
        );
    }

    return (
        <div className={`overflow-y-auto h-full ${className}`}>
            {conversations.map(conv => {
                const otherParticipant = conv.participants.find(p => p._id !== user._id) || conv.participants[0];
                const unread = conv.unreadCounts?.[user._id] || 0;

                return (
                    <div
                        key={conv._id}
                        onClick={() => onSelect(conv)}
                        className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 flex gap-3 items-start
                            ${activeId === conv._id ? 'bg-secondary/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                        `}
                    >
                        {/* Avatar */}
                        <div className="relative w-12 h-12 flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-secondary overflow-hidden border flex items-center justify-center">
                                {otherParticipant?.avatar ? (
                                    <img src={otherParticipant.avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 opacity-50" />
                                )}
                            </div>
                            {unread > 0 && (
                                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                                    {unread}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className={`font-medium truncate text-sm ${unread > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {otherParticipant?.name || 'Unknown'}
                                </h4>
                                {conv.lastMessage?.timestamp && (
                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                        {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: true }).replace('about ', '')}
                                    </span>
                                )}
                            </div>

                            <p className={`text-xs truncate ${unread > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                {conv.lastMessage?.sender === user._id ? 'You: ' : ''}
                                {conv.lastMessage?.content || 'Started a conversation'}
                            </p>

                            {/* Order Tag */}
                            {conv.orderId && (
                                <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 bg-secondary rounded border opacity-70">
                                    Order: {conv.orderId.garmentType}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;
