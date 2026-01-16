// components/SearchModal.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Gamepad2, User, FileText, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchService } from '@/services/search';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({ games: [], users: [], posts: [] });
  const [activeTab, setActiveTab] = useState<'all' | 'games' | 'users' | 'posts'>('all');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ games: [], users: [], posts: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      } else {
        setResults({ games: [], users: [], posts: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeTab]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await searchService.search({
        query,
        type: activeTab,
        limit: 5
      });
      setResults(response.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  const hasResults = results.games.length > 0 || results.users.length > 0 || results.posts.length > 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20">
      <div className="glass-card rounded-lg w-full max-w-2xl max-h-[600px] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              autoFocus
              type="text"
              placeholder="Search games, users, or posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 focus:ring-0 bg-transparent"
            />
            {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
            <button onClick={onClose} className="p-1 hover:bg-muted rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {['all', 'games', 'users', 'posts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[450px] p-4">
          {query.trim().length < 2 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Type at least 2 characters to search</p>
            </div>
          ) : !hasResults && !loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Games */}
              {results.games.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Gamepad2 className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Games</h3>
                  </div>
                  <div className="space-y-2">
                    {results.games.map((game: any) => (
                      <button
                        key={game._id}
                        onClick={() => handleNavigate(`/games/${game.slug || game._id}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      >
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{game.title}</div>
                          <div className="text-sm text-muted-foreground">{game.developer}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Users</h3>
                  </div>
                  <div className="space-y-2">
                    {results.users.map((user: any) => (
                      <button
                        key={user._id}
                        onClick={() => handleNavigate(`/profile/${user.username}`)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      >
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${user.username}`}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-muted-foreground">Level {user.level || 1}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                          user.role === 'moderator' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {results.posts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Posts</h3>
                  </div>
                  <div className="space-y-2">
                    {results.posts.map((post: any) => (
                      <button
                        key={post._id}
                        onClick={() => handleNavigate(`/forum/${post._id}`)}
                        className="w-full flex flex-col gap-1 p-3 hover:bg-muted rounded-lg transition-colors text-left"
                      >
                        <div className="font-medium truncate">{post.title}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {post.content?.substring(0, 100)}...
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{post.author?.username}</span>
                          <span>•</span>
                          <span>{post.game?.title}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex gap-4">
              <span><kbd className="px-2 py-1 bg-muted rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> Select</span>
              <span><kbd className="px-2 py-1 bg-muted rounded">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default SearchModal;