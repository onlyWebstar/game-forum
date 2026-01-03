import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Clock, 
  Share2, 
  Bookmark, 
  Flag,
  ChevronLeft,
  MoreHorizontal,
  Reply,
  Eye,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock post data
const mockPost = {
  id: '1',
  title: 'Best builds for new Elden Ring DLC? Share your experiences!',
  content: `
## Introduction

Hey fellow Tarnished! 🎮

I've been playing the new Shadow of the Erdtree DLC for about 30 hours now, and I'm absolutely blown away by the new areas, bosses, and weapons.

But I'm curious - what builds have you all been running? I've been trying a few different approaches and wanted to share my experiences.

## My Current Build

I've been running a **Dex/Faith hybrid** build focusing on the new incantations. Here's my setup:

- **Level:** 180
- **Vigor:** 60
- **Mind:** 30
- **Endurance:** 25
- **Strength:** 20
- **Dexterity:** 50
- **Intelligence:** 10
- **Faith:** 45
- **Arcane:** 10

### Weapons
1. **New DLC Katana** - Amazing scaling and weapon art
2. **Erdtree Seal** - For casting incantations
3. **Buckler** - For parrying those new tough enemies

## What I've Found Works

The new incantations are incredibly powerful if you have the stats for them. The fire-based ones especially seem to melt through a lot of the new enemies.

For boss fights, I've found that patience is key. The new bosses have much longer combo strings than anything in the base game.

## Questions for the Community

1. What level are you going into the DLC?
2. Has anyone tried a pure sorcery build? How does it compare?
3. Which new weapon has been your favorite so far?

Looking forward to hearing your thoughts! Let's discuss strategies and help each other out.

*May grace guide you!* ⚔️
  `,
  author: {
    id: '1',
    username: 'ShadowBlade99',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowBlade99',
    role: 'Veteran Gamer',
    joinDate: 'Jan 2022',
    posts: 342,
  },
  game: {
    id: '1',
    name: 'Elden Ring',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop',
  },
  category: 'discussions',
  likes: 342,
  dislikes: 12,
  comments: 89,
  views: 2341,
  createdAt: '2024-01-15T10:30:00Z',
  isPinned: true,
  tags: ['DLC', 'Builds', 'Strategy', 'Discussion'],
};

// Mock comments data with nested replies
const mockComments = [
  {
    id: '1',
    author: {
      username: 'DragonSlayer2024',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DragonSlayer2024',
      role: 'Pro Gamer',
    },
    content: 'Great guide! I\'ve been running a pure strength build with the new colossal weapons. The damage is insane but you really need to learn the timing. The new bosses punish greedy attacks hard.',
    likes: 45,
    dislikes: 2,
    createdAt: '2024-01-15T11:00:00Z',
    replies: [
      {
        id: '1-1',
        author: {
          username: 'ShadowBlade99',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowBlade99',
          role: 'Veteran Gamer',
        },
        content: 'Totally agree about the timing! Which colossal weapon have you been using? I tried the new greathammer but couldn\'t get the hang of it.',
        likes: 12,
        dislikes: 0,
        createdAt: '2024-01-15T11:15:00Z',
        replies: [
          {
            id: '1-1-1',
            author: {
              username: 'DragonSlayer2024',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DragonSlayer2024',
              role: 'Pro Gamer',
            },
            content: 'The new great axe! The weapon art is absolutely broken once you get the spacing right. Try it out!',
            likes: 8,
            dislikes: 0,
            createdAt: '2024-01-15T11:30:00Z',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    author: {
      username: 'MageSorcerer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MageSorcerer',
      role: 'Spellcaster',
    },
    content: 'Pure sorcery build here! It\'s actually really viable in the DLC. The new staffs have amazing scaling and there are some new spells that absolutely destroy bosses. Though I will say, the FP costs are quite high so you need a lot of Mind.',
    likes: 67,
    dislikes: 3,
    createdAt: '2024-01-15T12:00:00Z',
    replies: [
      {
        id: '2-1',
        author: {
          username: 'NewTarnished',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewTarnished',
          role: 'Newcomer',
        },
        content: 'What level of Mind do you recommend? I\'m at 25 and running out constantly.',
        likes: 5,
        dislikes: 0,
        createdAt: '2024-01-15T12:30:00Z',
        replies: [],
      },
    ],
  },
  {
    id: '3',
    author: {
      username: 'LoreMaster42',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LoreMaster42',
      role: 'Lore Expert',
    },
    content: 'Has anyone else noticed the lore implications of the new area? Without spoilers, the connections to Marika\'s past are fascinating. The item descriptions are wild!',
    likes: 89,
    dislikes: 1,
    createdAt: '2024-01-15T14:00:00Z',
    replies: [],
  },
];

interface Comment {
  id: string;
  author: {
    username: string;
    avatar: string;
    role: string;
  };
  content: string;
  likes: number;
  dislikes: number;
  createdAt: string;
  replies: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to like comments', variant: 'destructive' });
      return;
    }
    if (liked) {
      setLikes(likes - 1);
      setLiked(false);
    } else {
      setLikes(likes + 1);
      setLiked(true);
      if (disliked) {
        setDislikes(dislikes - 1);
        setDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to dislike comments', variant: 'destructive' });
      return;
    }
    if (disliked) {
      setDislikes(dislikes - 1);
      setDisliked(false);
    } else {
      setDislikes(dislikes + 1);
      setDisliked(true);
      if (liked) {
        setLikes(likes - 1);
        setLiked(false);
      }
    }
  };

  const handleReply = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to reply', variant: 'destructive' });
      return;
    }
    if (!replyContent.trim()) return;
    toast({ title: 'Reply posted!', description: 'Your reply has been added.' });
    setReplyContent('');
    setShowReplyForm(false);
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;

  return (
    <div className={`${depth > 0 ? 'ml-4 sm:ml-8 pl-4 border-l-2 border-border' : ''}`}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
            <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
            <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={`/profile/${comment.author.username}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {comment.author.username}
              </Link>
              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                {comment.author.role}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-foreground/90 text-sm sm:text-base leading-relaxed">
              {comment.content}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  liked ? 'text-success' : 'text-muted-foreground hover:text-success'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{likes}</span>
              </button>
              <button 
                onClick={handleDislike}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  disliked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{dislikes}</span>
              </button>
              {!isMaxDepth && (
                <button 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-4 flex gap-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1 min-h-[80px] resize-none"
                />
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={handleReply} className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowReplyForm(false)}
                    className="shrink-0"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likes, setLikes] = useState(mockPost.likes);
  const [dislikes, setDislikes] = useState(mockPost.dislikes);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to like posts', variant: 'destructive' });
      return;
    }
    if (liked) {
      setLikes(likes - 1);
      setLiked(false);
    } else {
      setLikes(likes + 1);
      setLiked(true);
      if (disliked) {
        setDislikes(dislikes - 1);
        setDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to dislike posts', variant: 'destructive' });
      return;
    }
    if (disliked) {
      setDislikes(dislikes - 1);
      setDisliked(false);
    } else {
      setDislikes(dislikes + 1);
      setDisliked(true);
      if (liked) {
        setLikes(likes - 1);
        setLiked(false);
      }
    }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to bookmark posts', variant: 'destructive' });
      return;
    }
    setBookmarked(!bookmarked);
    toast({ 
      title: bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
      description: bookmarked ? 'Post removed from your saved list.' : 'You can find this post in your profile.',
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied!', description: 'Post link copied to clipboard.' });
  };

  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      toast({ title: 'Please login to comment', variant: 'destructive' });
      return;
    }
    if (!newComment.trim()) return;
    toast({ title: 'Comment posted!', description: 'Your comment has been added to the discussion.' });
    setNewComment('');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link 
            to="/forum" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Forum
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Post Header */}
              <article className="glass-card p-6 sm:p-8">
                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {mockPost.isPinned && (
                    <span className="px-3 py-1 text-xs font-semibold bg-accent/20 text-accent rounded-full">
                      📌 Pinned
                    </span>
                  )}
                  <Link 
                    to={`/games/${mockPost.game.id}`}
                    className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors"
                  >
                    🎮 {mockPost.game.name}
                  </Link>
                  <span className="px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full capitalize">
                    {mockPost.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
                  {mockPost.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockPost.author.avatar} alt={mockPost.author.username} />
                    <AvatarFallback>{mockPost.author.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link 
                      to={`/profile/${mockPost.author.username}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {mockPost.author.username}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">{mockPost.author.role}</span>
                      <span>•</span>
                      <span>{mockPost.author.posts} posts</span>
                      <span>•</span>
                      <span>Joined {mockPost.author.joinDate}</span>
                    </div>
                  </div>
                </div>

                {/* Post Stats */}
                <div className="flex items-center gap-4 py-4 text-sm text-muted-foreground border-b border-border">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(mockPost.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {mockPost.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {mockPost.comments} comments
                  </span>
                </div>

                {/* Post Content */}
                <div className="py-6 prose prose-invert max-w-none">
                  <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {mockPost.content.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) {
                        return <h2 key={i} className="text-xl font-display font-bold text-foreground mt-6 mb-3">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={i} className="text-lg font-display font-semibold text-foreground mt-4 mb-2">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('- **')) {
                        const text = line.replace('- **', '').replace('**', ': ');
                        return <li key={i} className="ml-4 text-foreground/90">{text}</li>;
                      }
                      if (line.startsWith('1. **') || line.startsWith('2. **') || line.startsWith('3. **')) {
                        return <li key={i} className="ml-4 text-foreground/90 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                      }
                      if (line.includes('**')) {
                        const parts = line.split('**');
                        return (
                          <p key={i} className="my-2">
                            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-primary">{part}</strong> : part)}
                          </p>
                        );
                      }
                      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                        return <p key={i} className="my-2 italic text-muted-foreground">{line.replace(/\*/g, '')}</p>;
                      }
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="my-2">{line}</p>;
                    })}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap py-4 border-t border-border">
                  {mockPost.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full hover:bg-muted/80 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={liked ? 'default' : 'outline'} 
                      size="sm"
                      onClick={handleLike}
                      className={liked ? 'bg-success hover:bg-success/90' : ''}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {likes}
                    </Button>
                    <Button 
                      variant={disliked ? 'default' : 'outline'} 
                      size="sm"
                      onClick={handleDislike}
                      className={disliked ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {dislikes}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Share</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleBookmark}
                      className={bookmarked ? 'text-accent' : ''}
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline ml-1">Save</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Flag className="w-4 h-4 mr-2" />
                          Report Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </article>

              {/* Comments Section */}
              <section className="mt-8">
                <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Comments ({mockPost.comments})
                </h2>

                {/* New Comment Form */}
                <div className="glass-card p-4 sm:p-6 mb-6">
                  {isAuthenticated ? (
                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={user?.avatar} alt={user?.username} />
                        <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Join the discussion..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[100px] resize-none mb-3"
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                            <Send className="w-4 h-4 mr-2" />
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">Sign in to join the discussion</p>
                      <Link to="/login">
                        <Button variant="neon">Login to Comment</Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Comments List */}
                <div className="glass-card divide-y divide-border">
                  {mockComments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-6">
              {/* Game Info */}
              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-lg mb-4">About this Game</h3>
                <Link to={`/games/${mockPost.game.id}`} className="flex items-center gap-3 group">
                  <img 
                    src={mockPost.game.cover} 
                    alt={mockPost.game.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {mockPost.game.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">View all discussions</p>
                  </div>
                </Link>
              </div>

              {/* Author Card */}
              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-lg mb-4">About the Author</h3>
                <Link to={`/profile/${mockPost.author.username}`} className="flex items-center gap-3 group mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockPost.author.avatar} alt={mockPost.author.username} />
                    <AvatarFallback>{mockPost.author.username[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {mockPost.author.username}
                    </h4>
                    <p className="text-sm text-primary">{mockPost.author.role}</p>
                  </div>
                </Link>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="text-foreground">{mockPost.author.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total posts</span>
                    <span className="text-foreground">{mockPost.author.posts}</span>
                  </div>
                </div>
              </div>

              {/* Related Discussions */}
              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-lg mb-4">Related Discussions</h3>
                <div className="space-y-3">
                  {[
                    { title: 'New DLC boss ranking - hardest to easiest', comments: 156 },
                    { title: 'Best farming spots in Shadow of the Erdtree', comments: 89 },
                    { title: 'Hidden questlines guide - Full walkthrough', comments: 234 },
                  ].map((post, i) => (
                    <Link 
                      key={i}
                      to={`/forum/${i + 2}`}
                      className="block group"
                    >
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </p>
                      <span className="text-xs text-muted-foreground">{post.comments} comments</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetail;
