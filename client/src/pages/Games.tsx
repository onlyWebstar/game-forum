import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, MessageSquare, ChevronDown, Grid, List, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import api from '@/services/api';

const Games = () => {
  const [games, setGames] = useState<any[]>([]); // Store real games
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Toggle for Grid/List view

  useEffect(() => {
  const fetchGames = async () => {
    try {
      const response = await api.get('/games');
      
      // Look inside the response for the actual array
      // If backend returns { success: true, games: [...] }, use response.data.games
      // If backend returns just [...], use response.data
      const gamesArray = response.data.games || response.data.data || response.data;

      if (Array.isArray(gamesArray)) {
        setGames(gamesArray);
      } else {
        console.error("Data received is not an array:", gamesArray);
        setGames([]); // Fallback to empty array to prevent crash
      }
    } catch (error) {
      console.error("Failed to fetch games", error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  fetchGames();
}, []);

  // Filter games based on search input
  const filteredGames = games.filter((game) => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Game Library</h1>
            <p className="text-muted-foreground mt-1">Explore and discuss your favorite titles</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <div className="border-l border-border h-6 mx-2 hidden sm:block"></div>
            <div className="flex bg-secondary/50 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search games by title..." 
            className="pl-10 h-11 bg-secondary/30 border-secondary-foreground/10 focus:border-primary/50" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* --- CONTENT SECTION --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Gamepad2 className="w-12 h-12 mb-4 animate-bounce opacity-50" />
             <p>Loading Library...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">No games found matching "{searchTerm}"</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-primary">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col gap-4"
          }>
            {filteredGames.map((game) => (
              <Link 
                key={game._id} 
                to={`/games/${game._id}`} 
                className={`group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
                  viewMode === 'list' ? 'flex flex-row items-center h-24' : ''
                }`}
              >
                {/* Image Section */}
                <div className={`overflow-hidden relative ${viewMode === 'list' ? 'w-24 h-full shrink-0' : 'aspect-[3/4]'}`}>
                  <img 
                    src={game.coverImage || '/placeholder-game.jpg'} 
                    alt={game.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  {viewMode === 'grid' && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      {game.metacritic || 'N/A'}
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                       {viewMode === 'list' && (
                         <span className="text-xs text-primary mb-1 block">{game.genre?.[0] || 'Game'}</span>
                       )}
                       <h3 className="font-display font-bold truncate pr-2 group-hover:text-primary transition-colors">
                         {game.title}
                       </h3>
                    </div>
                    {viewMode === 'list' && (
                        <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                          <Star className="w-3 h-3 fill-current" /> {game.metacritic || 'N/A'}
                        </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                    <span className="truncate max-w-[120px]">{game.developer}</span>
                    <span className="flex items-center gap-1 text-xs bg-secondary/50 px-2 py-0.5 rounded">
                      <MessageSquare className="w-3 h-3" /> Discuss
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Games;