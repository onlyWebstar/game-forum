import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Star, 
  ExternalLink, 
  ArrowLeft,
  Clock,
  ThumbsUp,
  Share2,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

// Mock game data
const gameData = {
  id: '1',
  title: 'Elden Ring',
  cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=1200&fit=crop',
  banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=600&fit=crop',
  genre: 'Action RPG',
  developer: 'FromSoftware',
  publisher: 'Bandai Namco',
  releaseDate: '2022-02-25',
  platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
  rating: 4.8,
  metacritic: 96,
  description: `Elden Ring is an action role-playing game set in a world known as the Lands Between. Players explore this vast open world while battling powerful enemies and discovering hidden secrets. The game features challenging combat, deep lore, and endless exploration opportunities.

The collaboration between FromSoftware and George R.R. Martin has created a rich fantasy world filled with mystery and danger. Players can customize their character and approach challenges in multiple ways, making each playthrough unique.`,
  website: 'https://eldenring.bandainamcoent.com',
  screenshots: [
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0f?w=800&h=450&fit=crop',
    'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=800&h=450&fit=crop',
  ],
  discussions: 2891,
  followers: 45230,
};

// Mock discussions
const recentDiscussions = [
  {
    id: '1',
    title: 'Best builds for new DLC?',
    author: 'ShadowBlade99',
    likes: 342,
    comments: 89,
    timeAgo: '2h ago',
  },
  {
    id: '2',
    title: 'How to beat Malenia solo?',
    author: 'NewTarnished',
    likes: 156,
    comments: 234,
    timeAgo: '5h ago',
  },
  {
    id: '3',
    title: 'Hidden lore connections explained',
    author: 'LoreMaster42',
    likes: 567,
    comments: 145,
    timeAgo: '1d ago',
  },
];

const GameDetail: React.FC = () => {
  const { id } = useParams();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Banner */}
        <section className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={gameData.banner}
            alt={gameData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
          
          {/* Back button */}
          <div className="absolute top-4 left-4">
            <Link to="/games">
              <Button variant="ghost" className="bg-background/50 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
            </Link>
          </div>
        </section>

        {/* Game Info */}
        <section className="relative -mt-32 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cover & Actions */}
              <div className="shrink-0">
                <div className="w-48 mx-auto lg:mx-0">
                  <img
                    src={gameData.cover}
                    alt={gameData.title}
                    className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl border-4 border-border"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <Button variant="neon" className="w-full">
                    <Bookmark className="w-4 h-4" />
                    Follow Game
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 text-sm font-medium bg-primary/20 text-primary rounded-lg">
                    {gameData.genre}
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium bg-yellow-500/20 text-yellow-400 rounded-lg">
                    <Star className="w-4 h-4 fill-current" />
                    {gameData.rating}
                  </span>
                  {gameData.metacritic && (
                    <span className="px-3 py-1 text-sm font-medium bg-success/20 text-success rounded-lg">
                      Metacritic: {gameData.metacritic}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  {gameData.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(gameData.releaseDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {gameData.followers.toLocaleString()} followers
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {gameData.discussions.toLocaleString()} discussions
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Developer</p>
                    <p className="font-medium text-foreground">{gameData.developer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Publisher</p>
                    <p className="font-medium text-foreground">{gameData.publisher}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-muted-foreground">Platforms</p>
                    <p className="font-medium text-foreground">{gameData.platforms.join(', ')}</p>
                  </div>
                </div>

                <p className="text-muted-foreground whitespace-pre-line mb-6">
                  {gameData.description}
                </p>

                <a
                  href={gameData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Official Website
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold mb-6">
              <span className="gradient-text">Screenshots</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gameData.screenshots.map((screenshot, index) => (
                <div key={index} className="overflow-hidden rounded-xl game-card">
                  <img
                    src={screenshot}
                    alt={`${gameData.title} screenshot ${index + 1}`}
                    className="w-full aspect-video object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Discussions */}
        <section className="py-12 border-t border-border bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">
                <span className="gradient-text">Recent Discussions</span>
              </h2>
              <Link to="/forum">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentDiscussions.map((post) => (
                <Link
                  key={post.id}
                  to={`/forum/${post.id}`}
                  className="glass-card p-4 flex items-center gap-4 glow-hover group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                    {post.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>by {post.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.timeAgo}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.comments}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GameDetail;
