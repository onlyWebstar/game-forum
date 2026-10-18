// pages/GameDetail.tsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  Eye,
  ExternalLink,
  ArrowLeft,
  Clock,
  ThumbsUp,
  Share2,
  Heart,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { timeAgo } from '@/lib/time';

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();

  const [game, setGame] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await api.get(`/games/${id}`);
        if (cancelled) return;
        setGame(data.game);

        const postsRes = await api
          .get('/posts', { params: { game: data.game._id, limit: 5 } })
          .catch(() => null);
        if (!cancelled) setPosts(postsRes?.data.posts || []);
      } catch (error) {
        console.error('Failed to load game', error);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isFavorite = !!(user as any)?.favoriteGames?.some(
    (g: any) => (g?._id || g) === game?._id
  );

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({ title: 'Please log in to save favorites', variant: 'destructive' });
      return;
    }
    setFavBusy(true);
    try {
      const { data } = await api.put(`/users/favorites/${game._id}`);
      await refreshUser();
      toast({
        title: data.favorited ? 'Added to favorites' : 'Removed from favorites',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not update favorites',
        variant: 'destructive',
      });
    } finally {
      setFavBusy(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied!', description: 'Game link copied to clipboard.' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Loading game...
        </div>
      </Layout>
    );
  }

  if (notFound || !game) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <h1 className="font-display text-2xl font-bold">Game not found</h1>
          <p className="text-muted-foreground">It may have been removed.</p>
          <Link to="/games">
            <Button variant="outline">Back to Games</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const banner = game.bannerImage || game.coverImage;
  const score = game.metacriticScore;
  const scoreClass =
    score >= 75
      ? 'bg-success/20 text-success'
      : score >= 50
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-red-500/20 text-red-400';
  const screenshots = (game.screenshots || [])
    .map((s: any) => (typeof s === 'string' ? { url: s } : s))
    .filter((s: any) => s?.url);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Banner */}
        <section className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={banner}
            alt={game.title}
            className={`w-full h-full object-cover ${game.bannerImage ? '' : 'scale-110 blur-sm'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

          <div className="absolute top-4 left-4">
            <Link to="/games">
              <Button variant="ghost" className="bg-background/50 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
            </Link>
          </div>
        </section>

        {/* Game info */}
        <section className="relative -mt-32 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cover + actions */}
              <div className="shrink-0">
                <div className="w-48 mx-auto lg:mx-0">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl border-4 border-border"
                  />
                </div>
                <div className="mt-4 space-y-2 w-48 mx-auto lg:mx-0">
                  <Button
                    variant={isFavorite ? 'default' : 'neon'}
                    className="w-full"
                    onClick={toggleFavorite}
                    disabled={favBusy}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {(game.genres || []).map((genre: string) => (
                    <span
                      key={genre}
                      className="px-3 py-1 text-sm font-medium bg-primary/20 text-primary rounded-lg"
                    >
                      {genre}
                    </span>
                  ))}
                  {score != null && (
                    <span className={`px-3 py-1 text-sm font-medium rounded-lg ${scoreClass}`}>
                      Metacritic: {score}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                  {game.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {(game.postsCount || 0).toLocaleString()} discussions
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {(game.viewsCount || 0).toLocaleString()} views
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Developer</p>
                    <p className="font-medium text-foreground">{game.developer}</p>
                  </div>
                  {game.publisher && (
                    <div>
                      <p className="text-sm text-muted-foreground">Publisher</p>
                      <p className="font-medium text-foreground">{game.publisher}</p>
                    </div>
                  )}
                  {game.platforms?.length > 0 && (
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-sm text-muted-foreground">Platforms</p>
                      <p className="font-medium text-foreground">{game.platforms.join(', ')}</p>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground whitespace-pre-line mb-6">
                  {game.description}
                </p>

                {game.officialWebsite && (
                  <a
                    href={game.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Official Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Screenshots (only when the game has some) */}
        {screenshots.length > 0 && (
          <section className="py-12 border-t border-border">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold mb-6">
                <span className="gradient-text">Screenshots</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {screenshots.map((shot: any, index: number) => (
                  <div key={index} className="overflow-hidden rounded-xl game-card">
                    <img
                      src={shot.url}
                      alt={shot.caption || `${game.title} screenshot ${index + 1}`}
                      className="w-full aspect-video object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent discussions */}
        <section className="py-12 border-t border-border bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">
                <span className="gradient-text">Recent Discussions</span>
              </h2>
              <Link to={isAuthenticated ? `/forum/new?game=${game._id}` : '/login'}>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Start a discussion
                </Button>
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">
                  No discussions about {game.title} yet. Be the first!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/forum/${post._id}`}
                    className="glass-card p-4 flex items-center gap-4 glow-hover group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0">
                      {(post.author?.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>by {post.author?.username || 'Unknown'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.commentsCount || 0}
                      </span>
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

export default GameDetail;