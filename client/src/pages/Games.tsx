import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, MessageSquare, ChevronDown, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';

// Mock game data
const gamesData = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    genre: 'RPG',
    platform: ['PC', 'PS5', 'Xbox'],
    rating: 4.2,
    discussions: 1247,
    releaseDate: '2020-12-10',
  },
  {
    id: '2',
    title: 'Elden Ring',
    cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=600&fit=crop',
    genre: 'Action RPG',
    platform: ['PC', 'PS5', 'Xbox'],
    rating: 4.8,
    discussions: 2891,
    releaseDate: '2022-02-25',
  },
  {
    id: '3',
    title: 'Baldur\'s Gate 3',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    genre: 'CRPG',
    platform: ['PC', 'PS5'],
    rating: 4.9,
    discussions: 3421,
    releaseDate: '2023-08-03',
  },
  {
    id: '4',
    title: 'Starfield',
    cover: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    genre: 'Space RPG',
    platform: ['PC', 'Xbox'],
    rating: 3.9,
    discussions: 892,
    releaseDate: '2023-09-06',
  },
  {
    id: '5',
    title: 'Final Fantasy XVI',
    cover: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=400&h=600&fit=crop',
    genre: 'Action RPG',
    platform: ['PS5', 'PC'],
    rating: 4.5,
    discussions: 1567,
    releaseDate: '2023-06-22',
  },
  {
    id: '6',
    title: 'The Legend of Zelda: TotK',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    genre: 'Adventure',
    platform: ['Switch'],
    rating: 4.9,
    discussions: 4521,
    releaseDate: '2023-05-12',
  },
  {
    id: '7',
    title: 'Diablo IV',
    cover: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0f?w=400&h=600&fit=crop',
    genre: 'Action RPG',
    platform: ['PC', 'PS5', 'Xbox'],
    rating: 4.1,
    discussions: 2134,
    releaseDate: '2023-06-06',
  },
  {
    id: '8',
    title: 'Hogwarts Legacy',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    genre: 'Action RPG',
    platform: ['PC', 'PS5', 'Xbox', 'Switch'],
    rating: 4.4,
    discussions: 1879,
    releaseDate: '2023-02-10',
  },
];

const genres = ['All', 'RPG', 'Action RPG', 'CRPG', 'Adventure', 'FPS', 'Strategy', 'Sports'];
const platforms = ['All', 'PC', 'PS5', 'Xbox', 'Switch'];
const sortOptions = ['Popular', 'Rating', 'Recent', 'A-Z'];

const Games: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredGames = gamesData.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || game.genre === selectedGenre;
    const matchesPlatform = selectedPlatform === 'All' || game.platform.includes(selectedPlatform);
    return matchesSearch && matchesGenre && matchesPlatform;
  });

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="py-12 bg-gradient-to-b from-card/50 to-transparent">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              <span className="gradient-text">Game</span> Directory
            </h1>
            <p className="text-muted-foreground">
              Explore {gamesData.length}+ games and join the discussions
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border sticky top-16 z-40 glass-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter toggle (mobile) */}
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {/* Filters (desktop always visible, mobile toggleable) */}
              <div className={`flex flex-col lg:flex-row items-stretch lg:items-center gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
                {/* Genre */}
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="h-11 px-4 rounded-lg border-2 border-border bg-muted/50 text-foreground focus:border-primary focus:outline-none"
                >
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre === 'All' ? 'All Genres' : genre}</option>
                  ))}
                </select>

                {/* Platform */}
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="h-11 px-4 rounded-lg border-2 border-border bg-muted/50 text-foreground focus:border-primary focus:outline-none"
                >
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>{platform === 'All' ? 'All Platforms' : platform}</option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 px-4 rounded-lg border-2 border-border bg-muted/50 text-foreground focus:border-primary focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>Sort: {option}</option>
                  ))}
                </select>

                {/* View toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredGames.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No games found matching your criteria</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredGames.map((game) => (
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
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-md">
                            {game.genre}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            {game.rating}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {game.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            {game.discussions.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGames.map((game) => (
                  <Link
                    key={game.id}
                    to={`/games/${game.id}`}
                    className="glass-card p-4 flex items-center gap-4 glow-hover group"
                  >
                    <img
                      src={game.cover}
                      alt={game.title}
                      className="w-20 h-28 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-md">
                          {game.genre}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          {game.rating}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {game.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {game.discussions.toLocaleString()} discussions
                        </span>
                        <span className="hidden sm:block">
                          {game.platform.join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-sm text-muted-foreground">Released</p>
                      <p className="text-foreground">{new Date(game.releaseDate).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Games;
