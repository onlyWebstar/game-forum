import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Gamepad2, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Star,
  Clock,
  ThumbsUp,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import heroBg from '@/assets/hero-bg.jpg';

// Mock data for featured games
const featuredGames = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    genre: 'RPG',
    rating: 4.2,
    discussions: 1247,
  },
  {
    id: '2',
    title: 'Elden Ring',
    cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=600&fit=crop',
    genre: 'Action RPG',
    rating: 4.8,
    discussions: 2891,
  },
  {
    id: '3',
    title: 'Baldur\'s Gate 3',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    genre: 'CRPG',
    rating: 4.9,
    discussions: 3421,
  },
  {
    id: '4',
    title: 'Starfield',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    genre: 'Space RPG',
    rating: 3.9,
    discussions: 892,
  },
];

// Mock data for trending discussions
const trendingDiscussions = [
  {
    id: '1',
    title: 'Best builds for new Elden Ring DLC?',
    author: 'ShadowBlade99',
    game: 'Elden Ring',
    likes: 342,
    comments: 89,
    timeAgo: '2h ago',
  },
  {
    id: '2',
    title: 'Cyberpunk 2.0 completely changed the game',
    author: 'NightCityRunner',
    game: 'Cyberpunk 2077',
    likes: 567,
    comments: 134,
    timeAgo: '4h ago',
  },
  {
    id: '3',
    title: 'Theory: The connection between endings explained',
    author: 'LoreMaster42',
    game: 'Baldur\'s Gate 3',
    likes: 892,
    comments: 267,
    timeAgo: '6h ago',
  },
  {
    id: '4',
    title: 'Ship building guide for beginners',
    author: 'StarExplorer',
    game: 'Starfield',
    likes: 234,
    comments: 56,
    timeAgo: '8h ago',
  },
];

// Mock stats
const stats = [
  { label: 'Active Gamers', value: '125K+', icon: Users },
  { label: 'Games', value: '2,847', icon: Gamepad2 },
  { label: 'Discussions', value: '890K+', icon: MessageSquare },
  { label: 'Daily Posts', value: '5,200+', icon: TrendingUp },
];

const Index: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">NEXUS</span>
              <br />
              <span className="text-foreground">Gaming Community</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the ultimate gaming community. Discover games, share strategies, 
              and connect with players who share your passion.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="xl" variant="neon" className="group">
                  Join the Community
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/games">
                <Button size="xl" variant="outline">
                  Explore Games
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_30px_hsl(187_100%_50%/0.5)]">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                <span className="gradient-text">Featured</span> Games
              </h2>
              <p className="text-muted-foreground">Discover the hottest games in our community</p>
            </div>
            <Link to="/games">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="game-card group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <img
                    src={game.cover}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-md">
                        {game.genre}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        {game.rating}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-foreground truncate">
                      {game.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {game.discussions.toLocaleString()} discussions
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Discussions Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                <span className="gradient-text">Trending</span> Discussions
              </h2>
              <p className="text-muted-foreground">Join the conversation</p>
            </div>
            <Link to="/forum">
              <Button variant="ghost" className="group">
                View Forum
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {trendingDiscussions.map((post) => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="glass-card p-5 glow-hover group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                    {post.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-primary font-medium">{post.game}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.timeAgo}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">by {post.author}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ThumbsUp className="w-3 h-3" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
            <div className="relative z-10">
              <h2 className="font-display text-2xl sm:text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">Level Up</span>?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of gamers sharing tips, strategies, and epic gaming moments.
                Your next gaming squad awaits.
              </p>
              <Link to="/register">
                <Button size="xl" variant="neon" className="group">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
