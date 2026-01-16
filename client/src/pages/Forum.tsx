import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Clock, 
  ThumbsUp,
  Users,
  Plus,
  Filter,
  Search,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const Forum = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Data State
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ posts: 0, comments: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Posts
        const postsRes = await api.get('/posts');
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.posts || []);

        // 2. Fetch Stats (Deriving from users/posts for now if no dedicated stats endpoint)
        const usersRes = await api.get('/users/leaderboard?limit=1'); 
        // Note: You might want a dedicated /api/stats route later
        setStats({
          posts: postsRes.data.total || postsRes.data.length || 0,
          comments: 0, // Need backend comment count
          users: usersRes.data.total || 0
        });
      } catch (error) {
        console.error("Error fetching forum data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForumData();
  }, []);

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/forum/new');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold font-display">Community Forum</h1>
                <p className="text-muted-foreground mt-1">Discuss games, share guides, and connect.</p>
              </div>
              <Button onClick={handleCreatePost} variant="neon" className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Create Post
              </Button>
            </div>
          </div>
        </div>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Left Sidebar: Categories */}
              <aside className="lg:col-span-1 space-y-6">
                <div className="glass-card p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" /> Filter by Category
                  </h3>
                  <div className="space-y-1">
                    {['all', 'discussions', 'guides', 'reviews', 'news'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors capitalize text-sm ${
                          selectedCategory === cat ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-secondary'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Content: Post List */}
              <div className="lg:col-span-2 space-y-4">
                {/* Search Bar */}
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
                  <div className="text-center py-20"><p>Loading discussions...</p></div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-20 border border-dashed rounded-xl">
                    <p className="text-muted-foreground">No posts found.</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <Link 
                      key={post._id} 
                      to={`/forum/post/${post._id}`}
                      className="block glass-card p-5 hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <img 
                          src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`} 
                          className="w-10 h-10 rounded-full bg-secondary" 
                          alt="" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-primary uppercase">{post.category}</span>
                            <span className="text-xs text-muted-foreground">• {new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{post.title}</h3>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {post.likesCount || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.commentsCount || 0}</span>
                            <span className="ml-auto font-medium text-foreground">by {post.author?.username}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Right Sidebar: Stats */}
              <aside className="lg:col-span-1 space-y-6">
                <div className="glass-card p-5">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Forum Stats
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Posts</span>
                      <span className="font-bold">{stats.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="font-bold">{stats.users}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 text-center">
                  <Gamepad2 className="w-10 h-10 mx-auto mb-3 text-primary opacity-50" />
                  <h3 className="font-bold mb-2">Join the Conversation</h3>
                  <p className="text-xs text-muted-foreground mb-4">Share your level-up moments with the community.</p>
                  <Button onClick={handleCreatePost} variant="outline" className="w-full">New Post</Button>
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
