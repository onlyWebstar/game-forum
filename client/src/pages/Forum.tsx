// pages/Forum.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  TrendingUp,
  ThumbsUp,
  Plus,
  Filter,
  Search,
  Gamepad2,
  Pin,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const PAGE_SIZE = 10;

// Values must match the backend Post.postType enum
const CATEGORIES = [
  { value: 'all', label: 'All Posts' },
  { value: 'discussion', label: 'Discussions' },
  { value: 'review', label: 'Reviews' },
  { value: 'guide', label: 'Guides' },
  { value: 'question', label: 'Questions' },
];

const TYPE_LABELS: Record<string, string> = {
  discussion: 'Discussion',
  review: 'Review',
  guide: 'Guide',
  question: 'Question',
};

const timeAgo = (dateStr: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const excerpt = (content: string = '') =>
  content.replace(/[#*_`>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 140);

const Forum: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Data
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, comments: 0, games: 0 });
  const [activeGames, setActiveGames] = useState<any[]>([]);

  // Paging / loading
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Ignore responses from outdated requests (fast typing / quick filter changes)
  const requestId = useRef(0);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const loadPosts = useCallback(
    async (pageToLoad: number) => {
      const id = ++requestId.current;
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const { data } = await api.get('/posts', {
          params: {
            page: pageToLoad,
            limit: PAGE_SIZE,
            ...(category !== 'all' && { postType: category }),
            ...(debouncedSearch && { search: debouncedSearch }),
          },
        });
        if (id !== requestId.current) return;

        const incoming = data.posts || [];
        setPosts((prev) => (pageToLoad === 1 ? incoming : [...prev, ...incoming]));
        setPage(pageToLoad);
        setHasMore(pageToLoad < (data.pagination?.pages || 1));
      } catch (error) {
        console.error('Error fetching posts:', error);
        if (id === requestId.current && pageToLoad === 1) {
          setPosts([]);
          setHasMore(false);
        }
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [category, debouncedSearch]
  );

  // Reload from page 1 whenever the filters change
  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  // Sidebar stats (once)
  useEffect(() => {
    api
      .get('/stats')
      .then(({ data }) => {
        if (data.stats) setStats(data.stats);
        setActiveGames(data.activeGames || []);
      })
      .catch((error) => console.error('Error fetching stats:', error));
  }, []);

  const handleCreatePost = () => {
    navigate(isAuthenticated ? '/forum/new' : '/login');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold font-display">Community Forum</h1>
                <p className="text-muted-foreground mt-1">
                  Discuss games, share guides, and connect.
                </p>
              </div>
              <Button onClick={handleCreatePost} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Create Post
              </Button>
            </div>
          </div>
        </div>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left: categories */}
              <aside className="lg:col-span-1 space-y-6">
                <div className="glass-card p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" /> Categories
                  </h3>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                          category === cat.value
                            ? 'bg-primary/20 text-primary font-bold'
                            : 'hover:bg-secondary'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Middle: posts */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search discussions..."
                    className="pl-10 bg-card"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="text-center py-20 text-muted-foreground">
                    Loading discussions...
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground mb-4">
                      {debouncedSearch || category !== 'all'
                        ? 'No posts match your filters.'
                        : 'No posts yet. Be the first to start a discussion!'}
                    </p>
                    <Button variant="outline" onClick={handleCreatePost}>
                      Create a post
                    </Button>
                  </div>
                ) : (
                  <>
                    {posts.map((post) => (
                      <Link
                        key={post._id}
                        to={`/forum/${post._id}`}
                        className="block glass-card p-5 hover:border-primary/50 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={
                              post.author?.avatar ||
                              `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(
                                post.author?.username || 'U'
                              )}`
                            }
                            className="w-10 h-10 rounded-full bg-secondary object-cover"
                            alt=""
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              {post.isPinned && (
                                <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                                  <Pin className="w-3 h-3" /> Pinned
                                </span>
                              )}
                              <span className="text-xs font-bold text-primary uppercase">
                                {TYPE_LABELS[post.postType] || post.postType}
                              </span>
                              {post.game?.title && (
                                <span className="text-xs text-muted-foreground">
                                  • {post.game.title}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                • {timeAgo(post.createdAt)}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {excerpt(post.content)}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" /> {post.likesCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" /> {post.commentsCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" /> {post.viewsCount || 0}
                              </span>
                              <span className="ml-auto font-medium text-foreground truncate">
                                by {post.author?.username || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {hasMore && (
                      <div className="text-center pt-2">
                        <Button
                          variant="outline"
                          onClick={() => loadPosts(page + 1)}
                          disabled={loadingMore}
                        >
                          {loadingMore ? 'Loading...' : 'Load more'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right: stats + active games */}
              <aside className="lg:col-span-1 space-y-6">
                <div className="glass-card p-5">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Forum Stats
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posts</span>
                      <span className="font-bold">{stats.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comments</span>
                      <span className="font-bold">{stats.comments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-bold">{stats.users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Games</span>
                      <span className="font-bold">{stats.games}</span>
                    </div>
                  </div>
                </div>

                {activeGames.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-primary" /> Most Active Games
                    </h3>
                    <div className="space-y-3">
                      {activeGames.map((game) => (
                        <Link
                          key={game._id}
                          to={`/games/${game._id}`}
                          className="flex items-center gap-3 group"
                        >
                          <img
                            src={game.coverImage}
                            alt={game.title}
                            className="w-8 h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {game.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {game.postsCount || 0} posts
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="glass-card p-5 text-center">
                  <Gamepad2 className="w-10 h-10 mx-auto mb-3 text-primary opacity-50" />
                  <h3 className="font-bold mb-2">Join the Conversation</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Share your level-up moments with the community.
                  </p>
                  <Button onClick={handleCreatePost} variant="outline" className="w-full">
                    New Post
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Forum;