// pages/Notifications.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MessageSquare, Reply, ThumbsUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/hooks/use-toast';
import { timeAgo } from '@/lib/time';

const TYPE_META: Record<string, { icon: React.ElementType; text: string }> = {
  comment: { icon: MessageSquare, text: 'commented on your post' },
  reply: { icon: Reply, text: 'replied to your comment in' },
  post_like: { icon: ThumbsUp, text: 'liked your post' },
  comment_like: { icon: ThumbsUp, text: 'liked your comment in' },
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { unreadCount, setUnreadCount } = useNotifications();
  const { toast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login');
  }, [authLoading, isAuthenticated, navigate]);

  const load = useCallback(
    async (pageToLoad: number) => {
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data } = await api.get('/notifications', {
          params: { page: pageToLoad, limit: 20, ...(filter === 'unread' && { unread: 'true' }) },
        });
        const incoming = data.notifications || [];
        setItems((prev) => (pageToLoad === 1 ? incoming : [...prev, ...incoming]));
        setPage(pageToLoad);
        setHasMore(pageToLoad < (data.pagination?.pages || 1));
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Failed to load notifications', error);
        if (pageToLoad === 1) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter, setUnreadCount]
  );

  useEffect(() => {
    if (isAuthenticated) load(1);
  }, [isAuthenticated, load]);

  const open = async (n: any) => {
    if (!n.isRead) {
      try {
        await api.put(`/notifications/${n._id}/read`);
        setItems((prev) =>
          filter === 'unread'
            ? prev.filter((i) => i._id !== n._id)
            : prev.map((i) => (i._id === n._id ? { ...i, isRead: true } : i))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // still navigate even if marking failed
      }
    }
    if (n.post?._id) navigate(`/forum/${n.post._id}`);
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setItems((prev) => (filter === 'unread' ? [] : prev.map((i) => ({ ...i, isRead: true }))));
      setUnreadCount(0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not mark notifications as read',
        variant: 'destructive',
      });
    }
  };

  const remove = async (n: any) => {
    try {
      await api.delete(`/notifications/${n._id}`);
      setItems((prev) => prev.filter((i) => i._id !== n._id));
      if (!n.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not delete the notification',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Bell className="w-7 h-7 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </h1>
            <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>

          {/* Filter */}
          <div className="flex bg-secondary/30 p-1 rounded-lg w-fit mb-6">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm capitalize transition-all ${
                  filter === f
                    ? 'bg-background shadow-sm text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading notifications...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? "You're all caught up." : 'No notifications yet.'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You'll be notified when someone comments on, replies to, or likes your posts.
              </p>
            </div>
          ) : (
            <>
              <div className="glass-card divide-y divide-border overflow-hidden">
                {items.map((n) => {
                  const meta = TYPE_META[n.type] || TYPE_META.comment;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={n._id}
                      onClick={() => open(n)}
                      className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors ${
                        !n.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={
                            n.actor?.avatar ||
                            `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(
                              n.actor?.username || 'U'
                            )}`
                          }
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center">
                          <Icon className="w-3 h-3 text-primary" />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <strong>{n.actor?.username || 'Someone'}</strong> {meta.text}{' '}
                          {n.post?.title && <em className="text-primary not-italic">"{n.post.title}"</em>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.updatedAt)}</p>
                      </div>

                      {!n.isRead && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0"
                          aria-label="Unread"
                        />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(n);
                        }}
                        className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="text-center mt-4">
                  <Button variant="outline" onClick={() => load(page + 1)} disabled={loadingMore}>
                    {loadingMore ? 'Loading...' : 'Load more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;