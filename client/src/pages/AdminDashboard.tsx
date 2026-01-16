// pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Search, Users, Gamepad2, Shield, Edit, FileText } from 'lucide-react';
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

  // Fetch games
  useEffect(() => {
    if (activeTab === 'games') {
      fetchGames();
    }
  }, [activeTab]);

  // Fetch users
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Fetch posts
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await gamesService.getGames({ limit: 100 });
      setGames(response.games || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch games',
        variant: 'destructive',
      });
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
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
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
      toast({
        title: 'Error',
        description: 'Failed to fetch posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string, gameTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${gameTitle}"?`)) return;

    try {
      await gamesService.deleteGame(gameId);
      toast({
        title: 'Success',
        description: 'Game deleted successfully',
      });
      fetchGames();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete game',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      await api.delete(`/users/${userId}`);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) return;

    try {
      await api.delete(`/posts/${postId}`);
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      fetchPosts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold gradient-text">
              Admin Dashboard
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab('games')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'games'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              Games Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-5 h-5" />
              Users Management
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="w-5 h-5" />
              Posts Management
            </button>
          </div>

          {/* Search and Actions */}
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
            <GamesTable games={filteredGames} onDelete={handleDeleteGame} />
          ) : activeTab === 'users' ? (
            <UsersTable users={filteredUsers} onDelete={handleDeleteUser} currentUserId={user.id} />
          ) : (
            <PostsTable posts={filteredPosts} onDelete={handleDeletePost} />
          )}
        </div>

        {/* Add Game Modal */}
        {showAddGameModal && (
          <AddGameModal
            onClose={() => setShowAddGameModal(false)}
            onSuccess={() => {
              setShowAddGameModal(false);
              fetchGames();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

// Games Table Component
const GamesTable: React.FC<{ games: any[]; onDelete: (id: string, title: string) => void }> = ({
  games,
  onDelete,
}) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-lg">
        <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No games found</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Developer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Release Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
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
                      <div className="font-medium text-foreground">{game.title}</div>
                      <div className="text-sm text-muted-foreground">{game.genres?.join(', ')}</div>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(game._id, game.title)}
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

// Users Table Component
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

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Posts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Comments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="font-medium text-foreground">{user.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                    user.role === 'moderator' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.postsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.commentsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  Level {user.level || 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user._id, user.username)}
                    disabled={user._id === currentUserId}
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

// Posts Table Component
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

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
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

// Add Game Modal Component
const AddGameModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    coverImage: '',
    description: '',
    developer: '',
    publisher: '',
    releaseDate: '',
    genres: [] as string[],
    platforms: [] as string[],
    metacriticScore: '',
    officialWebsite: '',
  });

  const genreOptions = ['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Puzzle', 'Horror', 'FPS', 'MMORPG', 'Indie'];
  const platformOptions = ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Mobile'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await gamesService.createGame({
        ...formData,
        metacriticScore: formData.metacriticScore ? parseInt(formData.metacriticScore) : undefined,
      });

      toast({
        title: 'Success',
        description: 'Game added successfully',
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add game',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="font-display text-2xl font-bold mb-6">Add New Game</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cover Image URL *</label>
              <Input
                required
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-24 px-3 py-2 rounded-lg border-2 border-border bg-background text-foreground resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Developer *</label>
                <Input
                  required
                  value={formData.developer}
                  onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Publisher</label>
                <Input
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Release Date *</label>
              <Input
                required
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Genres *</label>
              <div className="flex flex-wrap gap-2">
                {genreOptions.map((genre) => (
                  <label key={genre} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.genres.includes(genre)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, genres: [...formData.genres, genre] });
                        } else {
                          setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platforms *</label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((platform) => (
                  <label key={platform} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, platforms: [...formData.platforms, platform] });
                        } else {
                          setFormData({ ...formData, platforms: formData.platforms.filter(p => p !== platform) });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Metacritic Score</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.metacriticScore}
                  onChange={(e) => setFormData({ ...formData, metacriticScore: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Official Website</label>
                <Input
                  type="url"
                  value={formData.officialWebsite}
                  onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Game'}
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