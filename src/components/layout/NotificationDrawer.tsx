import React, { useState } from 'react';
import { Bell, CheckCircle, Clock, Info, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Project Deadline Approaching',
    description: 'The Beach Cleanup Drive needs 5 more volunteers by Friday.',
    time: '2 hours ago',
    type: 'warning',
    read: false,
    icon: Clock,
  },
  {
    id: 2,
    title: 'Milestone Achieved!',
    description: 'Your company just hit 1,000 total volunteer hours this quarter.',
    time: '5 hours ago',
    type: 'success',
    read: false,
    icon: CheckCircle,
  },
  {
    id: 3,
    title: 'New Project Added',
    description: 'A new education initiative was added to the CSR portal.',
    time: '1 day ago',
    type: 'info',
    read: true,
    icon: Info,
  },
];

export function NotificationDrawer() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <Sheet>
      <SheetTrigger className="relative text-gray-400 hover:text-gray-500 mr-2" title="Notifications">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-blue-600">
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="py-4 space-y-4 h-[calc(100vh-100px)] overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg border flex gap-4 transition-colors cursor-pointer ${notification.read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100'}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className={`mt-1 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 ${
                  notification.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                  notification.type === 'success' ? 'bg-green-100 text-green-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] h-4 px-1.5">New</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">{notification.description}</p>
                  <p className="text-xs text-gray-400 font-medium">{notification.time}</p>
                </div>
              </div>
            );
          })}
          
          {notifications.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No notifications yet.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
