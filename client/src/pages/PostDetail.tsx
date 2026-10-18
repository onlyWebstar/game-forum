// pages/PostDetail.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  Share2,
  ChevronLeft,
  MoreHorizontal,
  Reply,
  Eye,
  Send,
  Pin,
  Lock,
  Trash2,
  Pencil,
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
import api from '@/services/api';
import { timeAgo } from '@/lib/time';

const MAX_REPLY_DEPTH = 5; // the backend rejects replies deeper than this

/* ---------- tree helpers ---------- */
const updateNode = (nodes: any[], id: string, fn: (c: any) => any): any[] =>
  nodes.map((n) =>
    n._id === id
      ? fn(n)
      : n.replies?.length
      ? { ...n, replies: updateNode(n.replies, id, fn) }
      : n
  );

const collectIds = (nodes: any[]): string[] =>
  nodes.flatMap((n) => [n._id, ...collectIds(n.replies || [])]);

/* ---------- a single comment (recursive) ---------- */
interface CommentItemProps {
  comment: any;
  depth?: number;
  currentUser: any;
  votes: Record<string, number>;
  locked: boolean;
  onVote: (id: string, value: 1 | -1) => void;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onEdit: (id: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  depth = 0,
  currentUser,
  votes,
  locked,
  onVote,
  onReply,
  onEdit,
  onDelete,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [busy, setBusy] = useState(false);

  const author = comment.author || {};
  const isOwner = !!currentUser && author._id === currentUser.id;
  const isMod = !!currentUser && ['admin', 'moderator'].includes(currentUser.role);
  const myVote = votes[comment._id] || 0;
  const canReply = !locked && !!currentUser && (comment.depth ?? depth) < MAX_REPLY_DEPTH;

  // Indent only the first few levels so deep threads don't get squeezed
  const indented = depth > 0 && depth <= 3;

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setBusy(true);
    const ok = await onReply(comment._id, replyText.trim());
    setBusy(false);
    if (ok) {
      setReplyText('');
      setShowReply(false);
    }
  };

  const submitEdit = async () => {
    if (!editText.trim()) return;
    setBusy(true);
    const ok = await onEdit(comment._id, editText.trim());
    setBusy(false);
    if (ok) setEditing(false);
  };

  return (
    <div className={indented ? 'ml-3 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-border' : ''}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
            <AvatarImage src={author.avatar} alt={author.username} />
            <AvatarFallback>{(author.username || '?')[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`/profile/${author.username}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {author.username || 'Deleted user'}
              </Link>
              {['admin', 'moderator'].includes(author.role) && (
                <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full capitalize">
                  {author.role}
                </span>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(comment.createdAt)}
                {comment.isEdited && ' (edited)'}
              </span>
            </div>

            {editing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={submitEdit} disabled={busy || !editText.trim()}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(false);
                      setEditText(comment.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-foreground/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => onVote(comment._id, 1)}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  myVote === 1 ? 'text-success' : 'text-muted-foreground hover:text-success'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{comment.likesCount || 0}</span>
              </button>
              <button
                onClick={() => onVote(comment._id, -1)}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  myVote === -1
                    ? 'text-destructive'
                    : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{comment.dislikesCount || 0}</span>
              </button>

              {canReply && (
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}

              {(isOwner || isMod) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isOwner && (
                      <DropdownMenuItem onClick={() => setEditing(true)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(comment._id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {showReply && (
              <div className="mt-4 flex gap-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 min-h-[80px] resize-none"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={submitReply}
                    disabled={busy || !replyText.trim()}
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReply(false)}
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

      {comment.replies?.length > 0 && (
        <div>
          {comment.replies.map((reply: any) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              currentUser={currentUser}
              votes={votes}
              locked={locked}
              onVote={onVote}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- the page ---------- */
const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [postVote, setPostVote] = useState(0);
  const [commentVotes, setCommentVotes] = useState<Record<string, number>>({});
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isMod = !!user && ['admin', 'moderator'].includes(user.role);
  const isPostOwner = !!user && post?.author?._id === user.id;

  const showError = (error: any, fallback: string) =>
    toast({
      title: 'Error',
      description: error?.response?.data?.message || fallback,
      variant: 'destructive',
    });

  const requireLogin = (action: string) => {
    if (!isAuthenticated) {
      toast({ title: `Please log in to ${action}`, variant: 'destructive' });
      return false;
    }
    return true;
  };

  /* ----- load the post ----- */
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await api.get(`/posts/${id}`);
        if (cancelled) return;
        setPost(data.post);

        // Other discussions about the same game
        if (data.post.game?._id) {
          api
            .get('/posts', { params: { game: data.post.game._id, limit: 6 } })
            .then((res) => {
              if (cancelled) return;
              setRelated(
                (res.data.posts || []).filter((p: any) => p._id !== data.post._id).slice(0, 4)
              );
            })
            .catch(() => {});
        }
      } catch (error) {
        console.error('Failed to load post', error);
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

  /* ----- load comments (+ my votes on them) ----- */
  const loadComments = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/comments/${id}/tree`);
      const tree = data.comments || [];
      setComments(tree);
      setTotalComments(data.total || 0);

      if (isAuthenticated) {
        const ids = collectIds(tree);
        if (ids.length > 0) {
          const res = await api.get('/likes/check', {
            params: { targetIds: ids.join(','), targetType: 'Comment' },
          });
          setCommentVotes(res.data.likes || {});
        } else {
          setCommentVotes({});
        }
      }
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  /* ----- my vote on the post ----- */
  useEffect(() => {
    if (!id || !isAuthenticated) {
      setPostVote(0);
      return;
    }
    api
      .get('/likes/check', { params: { targetIds: id, targetType: 'Post' } })
      .then((res) => setPostVote(res.data.likes?.[id] || 0))
      .catch(() => {});
  }, [id, isAuthenticated]);

  /* ----- actions ----- */
  const votePost = async (value: 1 | -1) => {
    if (!requireLogin('vote on posts') || !post) return;
    try {
      const { data } = await api.post('/likes', {
        targetType: 'Post',
        targetId: post._id,
        value,
      });
      setPost((p: any) => ({
        ...p,
        likesCount: data.data.likesCount,
        dislikesCount: data.data.dislikesCount,
      }));
      setPostVote(data.data.userLikeValue || 0);
    } catch (error) {
      showError(error, 'Could not save your vote');
    }
  };

  const voteComment = async (commentId: string, value: 1 | -1) => {
    if (!requireLogin('vote on comments')) return;
    try {
      const { data } = await api.post('/likes', {
        targetType: 'Comment',
        targetId: commentId,
        value,
      });
      setComments((tree) =>
        updateNode(tree, commentId, (c) => ({
          ...c,
          likesCount: data.data.likesCount,
          dislikesCount: data.data.dislikesCount,
        }))
      );
      setCommentVotes((v) => ({ ...v, [commentId]: data.data.userLikeValue || 0 }));
    } catch (error) {
      showError(error, 'Could not save your vote');
    }
  };

  const postComment = async (content: string, parentCommentId?: string): Promise<boolean> => {
    if (!requireLogin('comment') || !post) return false;
    try {
      await api.post('/comments', {
        content,
        postId: post._id,
        ...(parentCommentId && { parentCommentId }),
      });
      await loadComments();
      return true;
    } catch (error) {
      showError(error, 'Could not post your comment');
      return false;
    }
  };

  const submitTopLevelComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const ok = await postComment(newComment.trim());
    setSubmitting(false);
    if (ok) setNewComment('');
  };

  const editComment = async (commentId: string, content: string): Promise<boolean> => {
    try {
      const { data } = await api.put(`/comments/${commentId}`, { content });
      setComments((tree) =>
        updateNode(tree, commentId, (c) => ({
          ...c,
          content: data.comment.content,
          isEdited: true,
        }))
      );
      return true;
    } catch (error) {
      showError(error, 'Could not edit your comment');
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      toast({ title: 'Comment deleted' });
      await loadComments();
    } catch (error) {
      showError(error, 'Could not delete the comment');
    }
  };

  const deletePost = async () => {
    if (!post || !confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast({ title: 'Post deleted' });
      navigate('/forum');
    } catch (error) {
      showError(error, 'Could not delete the post');
    }
  };

  const toggleFlag = async (flag: 'pin' | 'lock') => {
    if (!post) return;
    try {
      const { data } = await api.put(`/posts/${post._id}/${flag}`);
      setPost((p: any) => ({
        ...p,
        isPinned: data.post.isPinned,
        isLocked: data.post.isLocked,
      }));
      toast({ title: data.message });
    } catch (error) {
      showError(error, `Could not ${flag} the post`);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Link copied!', description: 'Post link copied to clipboard.' });
  };

  /* ----- render ----- */
  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Loading post...
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <h1 className="font-display text-2xl font-bold">Post not found</h1>
          <p className="text-muted-foreground">It may have been deleted.</p>
          <Link to="/forum">
            <Button variant="outline">Back to Forum</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const author = post.author || {};
  const game = post.game;

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Forum
          </Link>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main column */}
            <div className="flex-1 min-w-0">
              <article className="glass-card p-6 sm:p-8">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {post.isPinned && (
                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 rounded-full">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  {post.isLocked && (
                    <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                  {game && (
                    <Link
                      to={`/games/${game._id}`}
                      className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors"
                    >
                      🎮 {game.title}
                    </Link>
                  )}
                  <span className="px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full capitalize">
                    {post.postType}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 break-words">
                  {post.title}
                </h1>

                {/* Author */}
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={author.avatar} alt={author.username} />
                    <AvatarFallback>{(author.username || '?')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      to={`/profile/${author.username}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {author.username || 'Deleted user'}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span className="text-primary">Level {author.level || 1}</span>
                      {author.postsCount != null && (
                        <>
                          <span>•</span>
                          <span>{author.postsCount} posts</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 py-4 text-sm text-muted-foreground border-b border-border flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {(post.viewsCount || 0).toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {totalComments} comments
                  </span>
                </div>

                {/* Content (plain text; whitespace preserved) */}
                <div className="py-6 text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                  {post.content}
                </div>

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap py-4 border-t border-border">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={postVote === 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => votePost(1)}
                      className={postVote === 1 ? 'bg-success hover:bg-success/90' : ''}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {post.likesCount || 0}
                    </Button>
                    <Button
                      variant={postVote === -1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => votePost(-1)}
                      className={postVote === -1 ? 'bg-destructive hover:bg-destructive/90' : ''}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {post.dislikesCount || 0}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Share</span>
                    </Button>

                    {(isPostOwner || isMod) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isMod && (
                            <>
                              <DropdownMenuItem onClick={() => toggleFlag('pin')}>
                                <Pin className="w-4 h-4 mr-2" />
                                {post.isPinned ? 'Unpin post' : 'Pin post'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleFlag('lock')}>
                                <Lock className="w-4 h-4 mr-2" />
                                {post.isLocked ? 'Unlock comments' : 'Lock comments'}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={deletePost} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </article>

              {/* Comments */}
              <section className="mt-8">
                <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Comments ({totalComments})
                </h2>

                <div className="glass-card p-4 sm:p-6 mb-6">
                  {post.isLocked ? (
                    <p className="text-center text-muted-foreground py-2 flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      This discussion is locked. New comments are disabled.
                    </p>
                  ) : isAuthenticated && user ? (
                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback>{user.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Join the discussion..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[100px] resize-none mb-3"
                          maxLength={5000}
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={submitTopLevelComment}
                            disabled={submitting || !newComment.trim()}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {submitting ? 'Posting...' : 'Post Comment'}
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

                {comments.length === 0 ? (
                  <div className="glass-card p-8 text-center text-muted-foreground">
                    No comments yet. Start the conversation!
                  </div>
                ) : (
                  <div className="glass-card divide-y divide-border px-4 sm:px-6">
                    {comments.map((comment) => (
                      <CommentItem
                        key={comment._id}
                        comment={comment}
                        currentUser={user}
                        votes={commentVotes}
                        locked={!!post.isLocked}
                        onVote={voteComment}
                        onReply={(parentId, content) => postComment(content, parentId)}
                        onEdit={editComment}
                        onDelete={deleteComment}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-6 shrink-0">
              {game && (
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-lg mb-4">About this Game</h3>
                  <Link to={`/games/${game._id}`} className="flex items-center gap-3 group">
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {game.title}
                      </h4>
                      {game.developer && (
                        <p className="text-sm text-muted-foreground truncate">{game.developer}</p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-lg mb-4">About the Author</h3>
                <Link
                  to={`/profile/${author.username}`}
                  className="flex items-center gap-3 group mb-4"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={author.avatar} alt={author.username} />
                    <AvatarFallback>{(author.username || '?')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {author.username || 'Deleted user'}
                    </h4>
                    <p className="text-sm text-primary">Level {author.level || 1}</p>
                  </div>
                </Link>
                <div className="space-y-2 text-sm">
                  {author.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member since</span>
                      <span className="text-foreground">
                        {new Date(author.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {author.postsCount != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total posts</span>
                      <span className="text-foreground">{author.postsCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {related.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-lg mb-4">
                    More about {game?.title || 'this game'}
                  </h3>
                  <div className="space-y-3">
                    {related.map((p) => (
                      <Link key={p._id} to={`/forum/${p._id}`} className="block group">
                        <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {p.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {p.commentsCount || 0} comments • {timeAgo(p.createdAt)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetail;