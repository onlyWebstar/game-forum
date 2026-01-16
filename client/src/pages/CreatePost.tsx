// pages/CreatePost.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PenTool, 
  Layout as LayoutIcon, 
  Eye, 
  Send, 
  X, 
  Gamepad2, 
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { postsService } from '@/services/posts';
import { gamesService } from '@/services/games';

const CreatePost: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'discussion' | 'review' | 'guide' | 'question'>('discussion');
  const [selectedGame, setSelectedGame] = useState('');
  const [tags, setTags] = useState('');
  const [games, setGames] = useState<any[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to create a post',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Check email verification
    if (user && !user.emailVerified) {
      toast({
        title: 'Email Verification Required',
        description: 'Please verify your email before creating posts',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
    
    // Fetch games for the dropdown
    fetchGames();
  }, [isAuthenticated, user, navigate, toast]);

  const fetchGames = async () => {
    setGamesLoading(true);
    try {
      const response = await gamesService.getGames({ limit: 100 });
      setGames(response.games || []);
    } catch (err) {
      console.error("Failed to load games", err);
      toast({
        title: 'Error',
        description: 'Failed to load games list',
        variant: 'destructive',
      });
    } finally {
      setGamesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedGame) {
      toast({
        title: 'Error',
        description: 'Please select a game',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        game: selectedGame,
        postType,
        tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      };

      await postsService.createPost(postData);
      
      toast({
        title: 'Success!',
        description: 'Your post has been published',
      });
      
      navigate('/forum');
    } catch (error: any) {
      console.error('Post creation error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <PenTool className="text-primary" /> Create Post
            </h1>
            <p className="text-muted-foreground">Share your thoughts with the community</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/forum')} className="text-muted-foreground">
            <X className="w-5 h-5 mr-2" /> Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 space-y-6">
                {/* Header Controls */}
                <div className="flex bg-secondary/30 p-1 rounded-lg w-fit">
                  <button 
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-4 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${!previewMode ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <LayoutIcon className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-4 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${previewMode ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </button>
                </div>

                {!previewMode ? (
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Post Title *</label>
                      <Input 
                        placeholder="Give your post a catchy title..." 
                        className="text-lg font-bold py-6 bg-secondary/20"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {title.length}/200 characters
                      </p>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content *</label>
                      <textarea 
                        className="w-full min-h-[300px] bg-secondary/20 border border-border rounded-xl p-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none text-foreground"
                        placeholder="What's on your mind? Share your gaming experiences, tips, reviews, or questions..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum 20 characters
                      </p>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags (Optional)</label>
                      <Input 
                        placeholder="e.g., multiplayer, tips, beginner-guide (comma separated)" 
                        className="bg-secondary/20"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate tags with commas
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[400px] prose prose-invert max-w-none">
                    <h1 className="text-3xl font-bold mb-4">{title || 'Untitled Post'}</h1>
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        {postType}
                      </span>
                      {tags.split(',').filter(t => t.trim()).map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-secondary/50 rounded-full text-sm">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="whitespace-pre-wrap text-muted-foreground">
                      {content || 'Nothing to preview yet...'}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                  <Button 
                    type="submit"
                    size="lg" 
                    disabled={loading || !title.trim() || !content.trim() || !selectedGame}
                    className="px-8"
                  >
                    {loading ? 'Publishing...' : 'Publish Post'}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar Settings */}
            <aside className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  Post Settings
                </h3>
                
                <div className="space-y-4">
                  {/* Post Type */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                      Post Type *
                    </label>
                    <select 
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                      className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm outline-none text-foreground"
                      required
                    >
                      <option value="discussion">Discussion</option>
                      <option value="review">Review</option>
                      <option value="guide">Guide</option>
                      <option value="question">Question</option>
                    </select>
                  </div>

                  {/* Game Selector */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" /> Related Game *
                    </label>
                    {gamesLoading ? (
                      <div className="text-sm text-muted-foreground">Loading games...</div>
                    ) : (
                      <select 
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm outline-none text-foreground"
                        required
                      >
                        <option value="">Select a game</option>
                        {games.map(game => (
                          <option key={game._id} value={game._id}>
                            {game.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                <h3 className="font-bold flex items-center gap-2 mb-3 text-primary">
                  <Info className="w-4 h-4" /> Posting Guidelines
                </h3>
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li>• Keep it respectful and on-topic</li>
                  <li>• No spoilers in the title</li>
                  <li>• Check for duplicate discussions</li>
                  <li>• Use clear, descriptive titles</li>
                  <li>• Add relevant tags for better discovery</li>
                </ul>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreatePost;