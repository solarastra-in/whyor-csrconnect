import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Newspaper, Send, MessageSquare, Heart, Share2, Megaphone, Trophy, Info } from 'lucide-react';
import { toast } from 'sonner';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'update' | 'success' | 'announcement';
  date: string;
  author: string;
  likes: number;
  image?: string;
  authorAvatar?: string;
}

const mockNews: NewsItem[] = [
  {
    id: 'n-1',
    title: 'Clean Ganga Initiative Reaches 50 Tons Waste Recycled Milestone!',
    content: 'Thanks to over 350 corporate volunteers across 12 companies, our riverbank restoration drive successfully removed and segregated 50 tons of plastic waste along the Ganges in Varanasi.',
    type: 'success',
    date: '2 hours ago',
    author: 'EcoBharat Team',
    likes: 42,
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'n-2',
    title: 'Q3 Corporate Donation Matching Limit Increased to 2:1',
    content: 'We are excited to announce enhanced 2:1 matching for all employee contributions toward rural education & digital literacy campaigns during Q3.',
    type: 'announcement',
    date: '1 day ago',
    author: 'CSR Council',
    likes: 28,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'n-3',
    title: '500 Saplings Planted in Gurugram Urban Afforestation Drive',
    content: 'Volunteers planted 500 native trees using the Miyawaki technique. Growth tracking metrics and carbon offset data will be uploaded to employee impact dashboards next week.',
    type: 'update',
    date: '2 days ago',
    author: 'Green Canopy Initiative',
    likes: 35,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
  }
];

export function CSRNewsFeed({ isAdmin = false }: { isAdmin?: boolean }) {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'update' as any });

  const handlePost = () => {
    if (!newPost.title || !newPost.content) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const item: NewsItem = {
      id: Math.random().toString(),
      title: newPost.title,
      content: newPost.content,
      type: newPost.type,
      date: 'Just now',
      author: 'You',
      likes: 0
    };
    
    setNews([item, ...news]);
    setIsPosting(false);
    setNewPost({ title: '', content: '', type: 'update' });
    toast.success('News update posted successfully!');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'announcement': return <Megaphone className="w-4 h-4 text-purple-500" />;
      case 'update': default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'announcement': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'update': default: return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
  };

  const handleLike = (id: string) => {
    setNews(news.map(n => n.id === id ? { ...n, likes: n.likes + 1 } : n));
  };

  return (
    <Card className="border-indigo-100 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-indigo-500" />
            CSR News & Updates
          </CardTitle>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setIsPosting(!isPosting)}>
              {isPosting ? 'Cancel' : 'Post Update'}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
        {isPosting && isAdmin && (
          <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-3 mb-4 animate-in slide-in-from-top-2">
            <Input 
              placeholder="Headline..." 
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              className="bg-white"
            />
            <Textarea 
              placeholder="What's the story?" 
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              className="bg-white resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge 
                  variant="outline" 
                  className={`cursor-pointer ${newPost.type === 'update' ? 'bg-blue-100 border-blue-300' : 'bg-white'}`}
                  onClick={() => setNewPost({...newPost, type: 'update'})}
                >
                  Update
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`cursor-pointer ${newPost.type === 'success' ? 'bg-amber-100 border-amber-300' : 'bg-white'}`}
                  onClick={() => setNewPost({...newPost, type: 'success'})}
                >
                  Success Story
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`cursor-pointer ${newPost.type === 'announcement' ? 'bg-purple-100 border-purple-300' : 'bg-white'}`}
                  onClick={() => setNewPost({...newPost, type: 'announcement'})}
                >
                  Announcement
                </Badge>
              </div>
              <Button size="sm" onClick={handlePost} className="bg-indigo-600 hover:bg-indigo-700">
                <Send className="w-4 h-4 mr-2" /> Post
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="p-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className={`${getBadgeColor(item.type)} flex gap-1 items-center px-2 py-0.5`}>
                  {getIcon(item.type)}
                  <span className="capitalize text-xs">{item.type}</span>
                </Badge>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.content}</p>
              {item.image && (
                <div className="h-40 w-full overflow-hidden rounded-md mb-3">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
                <div className="flex items-center gap-2">
                  {item.authorAvatar && (
                    <img src={item.authorAvatar} alt={item.author} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                  )}
                  <span className="text-xs font-medium text-gray-500">By {item.author}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleLike(item.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                    <Heart className="w-3.5 h-3.5" /> {item.likes}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                  </button>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
