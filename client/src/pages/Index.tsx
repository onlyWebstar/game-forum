// pages/Index.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Gamepad2,
  MessageSquare,
  Users,
  TrendingUp,
  Star,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import heroBg from '@/assets/hero-bg.jpg';

const Index: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const [featuredGames, setFeaturedGames] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, posts: 0, comments: 0, games: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      // allSettled: if one request fails the rest of the page still renders
      const [gamesResult, postsResult, statsResult] = await Promise.allSettled([
        loadFeaturedGames(),
        api.get('/posts', { params: { sort: 'popular', limit: 5 } }),
        api.get('/stats'),
      ]);

      if (gamesResult.status === 'fulfilled') {
        setFeaturedGames(gamesResult.value);
      } else {
        console.error('Failed to load featured games', gamesResult.reason);
      }

      if (postsResult.status === 'fulfilled') {
        setTrendingPosts(postsResult.value.data.posts || []);
      } else {
        console.error('Failed to load trending posts', postsResult.reason);
      }

      if (statsResult.status === 'fulfilled' && statsResult.value.data.stats) {
        setStats(statsResult.value.data.stats);
      }

      setLoading(false);
    };

    loadHomeData();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center justify-center pt-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            Your Ultimate <span className="gradient-text">Gaming</span>
            <br /> Community
          </h1>
          <p
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in opacity-0"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            Join the conversation, share your achievements, and discover your next favorite game.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-4 animate-fade-in opacity-0"
            style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}
          >
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="xl" variant="neon" className="group">
                    Join Community
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/games">
                  <Button size="xl" variant="secondary">
                    Browse Games
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/forum">
                  <Button size="xl" variant="neon" className="group">
                    Go to Forum
                    <MessageSquare className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={`/profile/${user?.username}`}>
                  <Button size="xl" variant="secondary">
                    My Profile
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="py-10 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Members', value: stats.users, icon: Users },
              { label: 'Discussions', value: stats.posts, icon: MessageSquare },
              { label: 'Games', value: stats.games, icon: Gamepad2 },
              { label: 'Comments', value: stats.comments, icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-display text-3xl font-bold">
                  {value.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured games */}
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Featured Games</h2>
              <p className="text-muted-foreground">Jump into the conversation around these titles</p>
            </div>
            <Link to="/games">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-center col-span-full text-muted-foreground">Loading games...</p>
            ) : featuredGames.length > 0 ? (
              featuredGames.map((game) => (
                <Link
                  key={game._id}
                  to={`/games/${game._id}`}
                  className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden bg-secondary/30">
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-xl font-bold mb-2">{game.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {game.metacriticScore != null && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" /> {game.metacriticScore}
                        </span>
                      )}
                      {game.genres?.[0] && <span>{game.genres[0]}</span>}
                      <span className="truncate">{game.developer}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center col-span-full text-muted-foreground">
                No games yet. An admin can add some from the Admin Dashboard.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Trending discussions */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Trending Discussions</h2>
              <p className="text-muted-foreground">What the community is talking about</p>
            </div>
            <Link to="/forum">
              <Button variant="ghost" className="gap-2">
                Open Forum <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading discussions...</p>
          ) : trendingPosts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground mb-4">No discussions yet. Start the first one!</p>
              <Link to={isAuthenticated ? '/forum/new' : '/login'}>
                <Button variant="outline">Create a post</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {trendingPosts.map((post) => (
                <Link
                  key={post._id}
                  to={`/forum/${post._id}`}
                  className="glass-card p-4 flex items-center gap-4 hover:border-primary/50 transition-all group"
                >
                  <img
                    src={
                      post.author?.avatar ||
                      `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(
                        post.author?.username || 'U'
                      )}`
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      by {post.author?.username || 'Unknown'}
                      {post.game?.title ? ` • ${post.game.title}` : ''}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" /> {post.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> {post.commentsCount || 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA (guests only) */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl sm:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Level Up</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Create a free account to post, comment, and join discussions about the games you love.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register">
                <Button size="xl" variant="neon">
                  Create Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="xl" variant="outline">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

// Featured games, falling back to the most popular ones when no game has been
// marked as featured yet (the Add Game form has no "featured" option).
async function loadFeaturedGames(): Promise<any[]> {
  const featured = await api.get('/games', { params: { featured: 'true', limit: 6 } });
  const list = featured.data.games ?? [];
  if (list.length > 0) return list;

  const fallback = await api.get('/games', { params: { sort: 'popular', limit: 6 } });
  return fallback.data.games ?? [];
}

export default Index;