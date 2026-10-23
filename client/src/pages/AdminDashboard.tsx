// pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Search,
  Users,
  Gamepad2,
  Shield,
  Edit,
  FileText,
  Star,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { gamesService } from '@/services/games';
import api from '@/services/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'games' | 'users' | 'posts'>('games');
  const [games, setGames] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    if (activeTab === 'games') fetchGames();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
  }, [activeTab]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await gamesService.getGames({ limit: 100 });
      setGames(response.games || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch games', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/leaderboard?limit=100');
      setUsers(response.data.users || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts?limit=100&sort=recent');
      setPosts(response.data.posts || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string, gameTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${gameTitle}"?`)) return;

    try {
      await gamesService.deleteGame(gameId);
      toast({ title: 'Success', description: 'Game deleted successfully' });
      fetchGames();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete game', variant: 'destructive' });
    }
  };

  const handleToggleFeatured = async (game: any) => {
    try {
      await gamesService.updateGame(game._id, { isFeatured: !game.isFeatured });
      toast({
        title: game.isFeatured ? 'Removed from featured' : 'Marked as featured',
        description: game.isFeatured
          ? `${game.title} no longer appears in the homepage's featured section.`
          : `${game.title} will appear in the homepage's featured section.`,
      });
      fetchGames();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update game',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      await api.delete(`/users/${userId}`);
      toast({ title: 'Success', description: 'User deleted successfully' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) return;

    try {
      await api.delete(`/posts/${postId}`);
      toast({ title: 'Success', description: 'Post deleted successfully' });
      fetchPosts();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const q = searchQuery.toLowerCase();
  const filteredGames = games.filter((game) => game.title.toLowerCase().includes(q));
  const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(q));
  const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(q));

  if (!user || user.role !== 'admin') {
    return null;
  }

  const tabClass = (tab: string) =>
    `flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
      activeTab === tab
        ? 'text-primary border-b-2 border-primary'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold gradient-text">Admin Dashboard</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border overflow-x-auto">
            <button onClick={() => setActiveTab('games')} className={tabClass('games')}>
              <Gamepad2 className="w-5 h-5" />
              Games Management
            </button>
            <button onClick={() => setActiveTab('users')} className={tabClass('users')}>
              <Users className="w-5 h-5" />
              Users Management
            </button>
            <button onClick={() => setActiveTab('posts')} className={tabClass('posts')}>
              <FileText className="w-5 h-5" />
              Posts Management
            </button>
          </div>

          {/* Search and actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === 'games' && (
              <Button onClick={() => setShowAddGameModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-4">Loading...</p>
            </div>
          ) : activeTab === 'games' ? (
            <GamesTable
              games={filteredGames}
              onEdit={setEditingGame}
              onToggleFeatured={handleToggleFeatured}
              onDelete={handleDeleteGame}
            />
          ) : activeTab === 'users' ? (
            <UsersTable users={filteredUsers} onDelete={handleDeleteUser} currentUserId={user.id} />
          ) : (
            <PostsTable posts={filteredPosts} onDelete={handleDeletePost} />
          )}
        </div>

        {/* Add / Edit game modal */}
        {(showAddGameModal || editingGame) && (
          <GameFormModal
            key={editingGame?._id || 'new'}
            game={editingGame}
            onClose={() => {
              setShowAddGameModal(false);
              setEditingGame(null);
            }}
            onSuccess={() => {
              setShowAddGameModal(false);
              setEditingGame(null);
              fetchGames();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

/* ------------------------------------------------------------------ */
/* Games table                                                         */
/* ------------------------------------------------------------------ */
const GamesTable: React.FC<{
  games: any[];
  onEdit: (game: any) => void;
  onToggleFeatured: (game: any) => void;
  onDelete: (id: string, title: string) => void;
}> = ({ games, onEdit, onToggleFeatured, onDelete }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-lg">
        <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No games found</p>
      </div>
    );
  }

  const th = 'px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider';

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className={th}>Game</th>
              <th className={th}>Developer</th>
              <th className={th}>Release Date</th>
              <th className={th}>Posts</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {games.map((game) => (
              <tr key={game._id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {game.title}
                        {game.isFeatured && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                            <Star className="w-3 h-3 fill-current" /> Featured
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {game.genres?.join(', ')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {game.developer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(game.releaseDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {game.postsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleFeatured(game)}
                      title={game.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                      className={game.isFeatured ? 'text-yellow-400' : 'text-muted-foreground'}
                    >
                      <Star className={`w-4 h-4 ${game.isFeatured ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(game)}
                      title="Edit game"
                      className="text-primary hover:bg-primary/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(game._id, game.title)}
                      title="Delete game"
                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Users table                                                         */
/* ------------------------------------------------------------------ */
const UsersTable: React.FC<{
  users: any[];
  onDelete: (id: string, username: string) => void;
  currentUserId: string;
}> = ({ users, onDelete, currentUserId }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-lg">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  const th = 'px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider';

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className={th}>User</th>
              <th className={th}>Role</th>
              <th className={th}>Posts</th>
              <th className={th}>Comments</th>
              <th className={th}>Level</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full" />
                    <div className="font-medium text-foreground">{u.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      u.role === 'admin'
                        ? 'bg-red-500/20 text-red-400'
                        : u.role === 'moderator'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {u.postsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {u.commentsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  Level {u.level || 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(u._id, u.username)}
                    disabled={u._id === currentUserId}
                    className="text-red-500 hover:text-red-700 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Posts table                                                         */
/* ------------------------------------------------------------------ */
const PostsTable: React.FC<{ posts: any[]; onDelete: (id: string, title: string) => void }> = ({
  posts,
  onDelete,
}) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-lg">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No posts found</p>
      </div>
    );
  }

  const th = 'px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider';

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className={th}>Title</th>
              <th className={th}>Author</th>
              <th className={th}>Game</th>
              <th className={th}>Type</th>
              <th className={th}>Engagement</th>
              <th className={th}>Date</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post) => (
              <tr key={post._id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="font-medium text-foreground truncate">{post.title}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {post.content?.substring(0, 60)}...
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author?.avatar}
                      alt={post.author?.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm">{post.author?.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {post.game?.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
                    {post.postType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <span>👍 {post.likesCount}</span>
                    <span>💬 {post.commentsCount}</span>
                    <span>👁️ {post.viewsCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(post._id, post.title)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Add / Edit game form                                                */
/* ------------------------------------------------------------------ */

// These lists must match the enums in models/Game.js
const GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Puzzle',
  'Horror', 'FPS', 'MMORPG', 'Indie', 'Fighting', 'Platformer', 'Battle Royale',
];
const PLATFORMS = [
  'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One',
  'Nintendo Switch', 'Mobile', 'VR',
];

const emptyForm = {
  title: '',
  coverImage: '',
  bannerImage: '',
  description: '',
  developer: '',
  publisher: '',
  releaseDate: '',
  genres: [] as string[],
  platforms: [] as string[],
  metacriticScore: '',
  officialWebsite: '',
  screenshots: '', // one URL per line
  isFeatured: false,
};

// Turn a game from the API into form values
const toForm = (game: any): typeof emptyForm => ({
  title: game.title || '',
  coverImage: game.coverImage || '',
  bannerImage: game.bannerImage || '',
  description: game.description || '',
  developer: game.developer || '',
  publisher: game.publisher || '',
  releaseDate: game.releaseDate ? String(game.releaseDate).slice(0, 10) : '',
  genres: game.genres || [],
  platforms: game.platforms || [],
  metacriticScore: game.metacriticScore != null ? String(game.metacriticScore) : '',
  officialWebsite: game.officialWebsite || '',
  screenshots: (game.screenshots || [])
    .map((s: any) => (typeof s === 'string' ? s : s?.url))
    .filter(Boolean)
    .join('\n'),
  isFeatured: !!game.isFeatured,
});

const GameFormModal: React.FC<{
  game: any | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ game, onClose, onSuccess }) => {
  const isEdit = !!game;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(game ? toForm(game) : emptyForm);

  const set = (patch: Partial<typeof emptyForm>) => setForm((f) => ({ ...f, ...patch }));

  const toggleIn = (key: 'genres' | 'platforms', value: string) =>
    set({
      [key]: form[key].includes(value)
        ? form[key].filter((v) => v !== value)
        : [...form[key], value],
    } as Partial<typeof emptyForm>);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.genres.length === 0 || form.platforms.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Select at least one genre and one platform.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      title: form.title.trim(),
      coverImage: form.coverImage.trim(),
      bannerImage: form.bannerImage.trim(),
      description: form.description.trim(),
      developer: form.developer.trim(),
      publisher: form.publisher.trim(),
      releaseDate: form.releaseDate,
      genres: form.genres,
      platforms: form.platforms,
      // null clears the score when the field is emptied
      metacriticScore: form.metacriticScore === '' ? null : Number(form.metacriticScore),
      officialWebsite: form.officialWebsite.trim(),
      screenshots: form.screenshots
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url) => ({ url })),
      isFeatured: form.isFeatured,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await gamesService.updateGame(game._id, payload);
      } else {
        await gamesService.createGame(payload);
      }
      toast({
        title: 'Success',
        description: isEdit ? 'Game updated successfully' : 'Game added successfully',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          (isEdit ? 'Failed to update game' : 'Failed to add game'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'block text-sm font-medium mb-2';
  const textareaClass =
    'w-full px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground resize-none';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="font-display text-2xl font-bold mb-1">
            {isEdit ? 'Edit Game' : 'Add New Game'}
          </h2>
          {isEdit && (
            <p className="text-sm text-muted-foreground mb-6">
              Changing the title also changes the game's slug (its readable URL). Links that use the
              game's ID keep working.
            </p>
          )}
          {!isEdit && <div className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Title *</label>
              <Input required value={form.title} onChange={(e) => set({ title: e.target.value })} />
            </div>

            <div>
              <label className={labelClass}>Cover Image URL *</label>
              <Input
                required
                type="url"
                value={form.coverImage}
                onChange={(e) => set({ coverImage: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Banner Image URL</label>
              <Input
                type="url"
                placeholder="Optional - wide image shown at the top of the game page"
                value={form.bannerImage}
                onChange={(e) => set({ bannerImage: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                className={`${textareaClass} h-28`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Developer *</label>
                <Input
                  required
                  value={form.developer}
                  onChange={(e) => set({ developer: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Publisher</label>
                <Input
                  value={form.publisher}
                  onChange={(e) => set({ publisher: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Release Date *</label>
              <Input
                required
                type="date"
                value={form.releaseDate}
                onChange={(e) => set({ releaseDate: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClass}>Genres *</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {GENRES.map((genre) => (
                  <label key={genre} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.genres.includes(genre)}
                      onChange={() => toggleIn('genres', genre)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>Platforms *</label>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {PLATFORMS.map((platform) => (
                  <label key={platform} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.platforms.includes(platform)}
                      onChange={() => toggleIn('platforms', platform)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Metacritic Score</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.metacriticScore}
                  onChange={(e) => set({ metacriticScore: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Official Website</label>
                <Input
                  type="url"
                  value={form.officialWebsite}
                  onChange={(e) => set({ officialWebsite: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Screenshot URLs</label>
              <textarea
                value={form.screenshots}
                onChange={(e) => set({ screenshots: e.target.value })}
                placeholder={'One image URL per line (optional)'}
                className={`${textareaClass} h-24`}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set({ isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">
                <span className="font-medium">Featured game</span>
                <span className="text-muted-foreground"> - show it in the homepage's featured section</span>
              </span>
            </label>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading
                  ? isEdit
                    ? 'Saving...'
                    : 'Adding...'
                  : isEdit
                  ? 'Save Changes'
                  : 'Add Game'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;