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
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Riverbank Cleanup a Huge Success!',
    content: 'Thanks to the 120 volunteers who showed up this weekend. We collected over 500kg of plastic waste and planted 50 saplings along the bank. Incredible team effort!',
    type: 'success',
    date: '2 hours ago',
    author: 'Sarah Admin',
    likes: 24
  },
  {
    id: '2',
    title: 'New Partnership with Tech for Good',
    content: 'We are thrilled to announce a new partnership providing digital literacy classes to underprivileged youth. Check out the Discover Projects page to sign up as a mentor.',
    type: 'announcement',
    date: '1 day ago',
    author: 'CSR Committee',
    likes: 45
  },
  {
    id: '3',
    title: 'Q3 Volunteer Goals Update',
    content: 'We are 75% of the way to our company-wide goal of 10,000 volunteer hours for Q3. Keep up the great work everyone, just a little more push needed!',
    type: 'update',
    date: '3 days ago',
    author: 'Global Impact Team',
    likes: 12
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
              
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
                <span className="text-xs font-medium text-gray-500">By {item.author}</span>
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
