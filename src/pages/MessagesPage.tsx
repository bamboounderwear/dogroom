import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Chat, ChatMessage, User } from '@shared/types';
import { DEMO_USER_ID } from '@shared/mock-data';
import { Card, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { SendHorizonal, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
export function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { data: chatsResponse, isLoading: isLoadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: () => api<{ items: Chat[] }>('/api/chats'),
  });
  useEffect(() => {
    if (!selectedChatId && chatsResponse?.items?.length) {
      setSelectedChatId(chatsResponse.items[0].id);
    }
  }, [chatsResponse, selectedChatId]);
  return (
    <AppLayout container>
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-display">Messages</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          <Card className="md:col-span-1 lg:col-span-1">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {isLoadingChats
                  ? Array.from({ length: 3 }).map((_, i) => <ChatListItemSkeleton key={i} />)
                  : chatsResponse?.items.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                      />
                    ))}
              </div>
            </ScrollArea>
          </Card>
          <div className="md:col-span-2 lg:col-span-3">
            {selectedChatId ? (
              <ChatWindow chatId={selectedChatId} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-muted rounded-lg">
                <MessageSquare className="w-16 h-16 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
function ChatListItem({ chat, isSelected, onClick }: { chat: Chat; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3',
        isSelected ? 'bg-dogroom-primary/10' : 'hover:bg-muted'
      )}
    >
      <Avatar>
        <AvatarFallback>{chat.title.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{chat.title}</p>
        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.text ?? 'No messages yet'}</p>
      </div>
    </button>
  );
}
function ChatListItemSkeleton() {
    return (
        <div className="p-3 flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    )
}
function ChatWindow({ chatId }: { chatId: string }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => api<ChatMessage[]>(`/api/chats/${chatId}/messages`),
  });
  const sendMessageMutation = useMutation({
    mutationFn: (newMessage: { userId: string; text: string }) =>
      api(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify(newMessage),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      setText('');
    },
  });
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessageMutation.mutate({ userId: DEMO_USER_ID, text: text.trim() });
  };
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        {/* Could fetch chat details here */}
        <p className="font-semibold">Conversation</p>
      </CardHeader>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
            <AnimatePresence>
          {isLoading
            ? <p>Loading messages...</p>
            : messages?.map((msg) => (
                <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <MessageBubble message={msg} />
                </motion.div>
              ))}
            </AnimatePresence>
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="p-4 border-t flex items-center gap-2">
        <Input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={sendMessageMutation.isPending}
        />
        <Button type="submit" size="icon" disabled={sendMessageMutation.isPending}>
          <SendHorizonal className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}
function MessageBubble({ message }: { message: ChatMessage }) {
  const isMe = message.userId === DEMO_USER_ID;
  return (
    <div className={cn('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
      {!isMe && <Avatar className="w-8 h-8"><AvatarFallback>U</AvatarFallback></Avatar>}
      <div
        className={cn(
          'max-w-xs md:max-w-md p-3 rounded-2xl',
          isMe ? 'bg-dogroom-primary text-white rounded-br-none' : 'bg-muted rounded-bl-none'
        )}
      >
        <p>{message.text}</p>
      </div>
    </div>
  );
}