import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Clock, 
  ThumbsUp,
  Users,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

// Mock data for categories
const categories = [
  { id: 'discussions', name: 'Discussions', icon: MessageSquare, count: 12453, color: 'text-primary' },
  { id: 'reviews', name: 'Reviews', icon: Star, count: 4521, color: 'text-yellow-400' },
  { id: 'guides', name: 'Guides', icon: TrendingUp, count: 2341, color: 'text-success' },
  { id: 'questions', name: 'Questions', icon: Users, count: 8976, color: 'text-secondary' },
];

// Mock posts data
const postsData = [
  {
    id: '1',
    title: 'Best builds for new Elden Ring DLC? Share your experiences!',
    author: {
      username: 'ShadowBlade99',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowBlade99',
    },
    game: 'Elden Ring',
    category: 'discussions',
    likes: 342,
    comments: 89,
    views: 2341,
    timeAgo: '2h ago',
    isPinned: true,
  },
  {
    id: '2',
    title: 'Cyberpunk 2.0 completely changed the game - Full Review',
    author: {
      username: 'NightCityRunner',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NightCityRunner',
    },
    game: 'Cyberpunk 2077',
    category: 'reviews',
    likes: 567,
    comments: 134,
    views: 5672,
    timeAgo: '4h ago',
    isPinned: false,
  },
  {
    id: '3',
    title: 'Theory: The connection between all endings explained [SPOILERS]',
    author: {
      username: 'LoreMaster42',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LoreMaster42',
    },
    game: 'Baldur\'s Gate 3',
    category: 'discussions',
    likes: 892,
    comments: 267,
    views: 8934,
    timeAgo: '6h ago',
    isPinned: true,
  },
  {
    id: '4',
    title: 'Complete Ship Building Guide for Beginners',
    author: {
      username: 'StarExplorer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StarExplorer',
    },
    game: 'Starfield',
    category: 'guides',
    likes: 234,
    comments: 56,
    views: 3421,
    timeAgo: '8h ago',
    isPinned: false,
  },
  {
    id: '5',
    title: 'How do I beat Malenia? Need tips!',
    author: {
      username: 'NewTarnished',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewTarnished',
    },
    game: 'Elden Ring',
    category: 'questions',
    likes: 45,
    comments: 123,
    views: 1245,
    timeAgo: '12h ago',
    isPinned: false,
  },
  {
    id: '6',
    title: 'My honest review after 200 hours - Is it worth it?',
    author: {
      username: 'HardcoreGamer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HardcoreGamer',
    },
    game: 'Diablo IV',
    category: 'reviews',
    likes: 678,
    comments: 189,
    views: 7823,
    timeAgo: '1d ago',
    isPinned: false,
  },
];

// Mock trending games
const trendingGames = [
  { id: '1', name: 'Elden Ring', posts: 1234 },
  { id: '2', name: 'Baldur\'s Gate 3', posts: 987 },
  { id: '3', name: 'Cyberpunk 2077', posts: 765 },
  { id: '4', name: 'Starfield', posts: 543 },
  { id: '5', name: 'Diablo IV', posts: 432 },
];

const Forum: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPosts = postsData.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-card/50 to-transparent">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                  <span className="gradient-text">Community</span> Forum
                </h1>
                <p className="text-muted-foreground">
                  Join the conversation with fellow gamers
                </p>
              </div>
              <Link to="/forum/new">
                <Button variant="neon" className="group">
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-6 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
                    className={`glass-card p-4 text-left transition-all duration-300 ${
                      selectedCategory === category.id ? 'neon-border' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${category.color} mb-2`} />
                    <h3 className="font-display font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count.toLocaleString()} posts</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Posts */}
              <div className="flex-1">
                {/* Search & Filter */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                {/* Posts list */}
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/forum/${post.id}`}
                      className="glass-card p-5 block glow-hover group"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={post.author.avatar}
                          alt={post.author.username}
                          className="w-12 h-12 rounded-full border-2 border-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {post.isPinned && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-md">
                                Pinned
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-md">
                              {post.game}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-md capitalize">
                              {post.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <span>by <span className="text-foreground">{post.author.username}</span></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.timeAgo}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <ThumbsUp className="w-4 h-4" />
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MessageSquare className="w-4 h-4" />
                              {post.comments}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              {post.views}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="w-full lg:w-80 space-y-6">
                {/* Trending Games */}
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Trending Games
                  </h3>
                  <div className="space-y-3">
                    {trendingGames.map((game, index) => (
                      <Link
                        key={game.id}
                        to={`/games/${game.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-foreground group-hover:text-primary transition-colors">
                          {game.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {game.posts} posts
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Forum Stats */}
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-lg mb-4">Forum Stats</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Posts</span>
                      <span className="text-foreground font-semibold">28,291</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Comments</span>
                      <span className="text-foreground font-semibold">156,432</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="text-foreground font-semibold">12,456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Posts Today</span>
                      <span className="text-success font-semibold">+247</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="glass-card p-5 text-center">
                  <h3 className="font-display font-semibold mb-2">Join the Discussion</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your thoughts and connect with gamers
                  </p>
                  <Link to="/forum/new">
                    <Button variant="neon" className="w-full">
                      Create Post
                    </Button>
                  </Link>
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
