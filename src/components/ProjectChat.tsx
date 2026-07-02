import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { useAuth } from '@/src/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any;
}

export function ProjectChat({ projectId, projectName }: { projectId: string | number, projectName: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'projectChats', String(projectId), 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [projectId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'projectChats', String(projectId), 'messages'), {
        text,
        userId: user.uid,
        userName: user.displayName || 'Volunteer',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Team Chat: {projectName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
              No messages yet. Say hello to your team!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.userId === user?.uid;
              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {msg.userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {!isMe && <div className="text-xs font-semibold text-gray-600 mb-1">{msg.userName}</div>}
                    <div className="text-sm">{msg.text}</div>
                    {msg.createdAt && (
                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                        {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'h:mm a') : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <form onSubmit={handleSendMessage} className="p-3 border-t bg-gray-50 flex gap-2">
          <Input 
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
