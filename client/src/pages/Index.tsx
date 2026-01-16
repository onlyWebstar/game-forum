import React, { useEffect, useState } from 'react'; // Added hooks
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, MessageSquare, Users, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext'; // Import Auth Context
import api from '@/services/api'; // Import API client
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const { isAuthenticated, user } = useAuth(); // Get auth state
  const [featuredGames, setFeaturedGames] = useState([]); // State for real games
  const [loading, setLoading] = useState(true);

  // Fetch real games on load
  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch top 3 games (you might want to add a limit to your backend API later)
        const { data } = await api.get('/games');
        setFeaturedGames(data.slice(0, 3)); 
      } catch (error) {
        console.error("Failed to load featured games", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center pt-20 overflow-hidden">
        {/* ... (Keep your existing background divs) ... */}
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            Your Ultimate <span className="gradient-text">Gaming</span><br /> Community
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Join the conversation, share your achievements, and discover your next favorite game.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            {/* CONDITIONAL RENDERING: Change buttons based on login status */}
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="xl" variant="neon" className="group">
                    Join Community
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/games">
                  <Button size="xl" variant="secondary">Browse Games</Button>
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
                  <Button size="xl" variant="secondary">My Profile</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Featured Games</h2>
              <p className="text-muted-foreground">Trending discussions this week</p>
            </div>
            <Link to="/games">
              <Button variant="ghost" className="gap-2">View All <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
               <p className="text-center col-span-3">Loading games...</p>
            ) : featuredGames.length > 0 ? (
              featuredGames.map((game: any) => (
                <Link key={game._id} to={`/games/${game._id}`} className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-xl font-bold mb-2">{game.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" /> {game.metacritic || 'N/A'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center col-span-3 text-muted-foreground">No games found. Admin needs to upload some!</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - Hide if logged in */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="container mx-auto px-4">
             {/* ... Keep existing CTA content ... */}
             <h2 className="font-display text-2xl sm:text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">Level Up</span>?
             </h2>
             {/* ... */}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Index;