import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bell, BellOff, Check, CheckCheck, Trash2, MessageCircle, Heart, User } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'reaction':
        return <Heart size={16} className="text-red-500" />;
      case 'follow':
        return <User size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white dark:bg-gray-800';
    
    switch (type) {
      case 'comment':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'reaction':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'follow':
        return 'bg-green-50 dark:bg-green-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-800/50';
    }
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <Bell size={18} />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`relative transition-colors ${className}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Bell size={20} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount}</Badge>
                )}
              </CardTitle>
              
              {notifications.length > 0 && (
                <div className="flex space-x-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="h-8 px-2 text-xs"
                    >
                      <CheckCheck size={14} className="mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <BellOff className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  You'll see activity from your social network here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {notifications.map((notification) => {
                    const displayName = notification.actor_profile?.display_name || 
                                     notification.actor_profile?.email || 
                                     'Someone';
                    const avatarUrl = notification.actor_profile?.avatar_url;
                    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                          getNotificationBgColor(notification.type, notification.is_read)
                        }`}
                        onClick={() => {
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                              <AvatarFallback className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold">
                                {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">{displayName}</span>{' '}
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {timeAgo}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;