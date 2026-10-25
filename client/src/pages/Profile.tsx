// pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  Settings,
  MessageSquare,
  ThumbsUp,
  FileText,
  Trophy,
  Lock,
  Mail,
  Clock,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { timeAgo } from '@/lib/time';

const fallbackAvatar = (name: string) =>
  `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(name)}`;

const Profile: React.FC = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [restricted, setRestricted] = useState<null | 'private' | 'members'>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setRestricted(null);
      setPosts([]);
      try {
        const { data } = await api.get(`/users/${username}`);
        if (cancelled) return;
        setProfile(data.user);

        if (data.restricted) {
          setRestricted(data.reason);
          return;
        }

        // Only ask for the posts when the owner shares their activity
        if (data.user.canViewActivity) {
          const postsRes = await api.get(`/users/${username}/posts?limit=10`);
          if (!cancelled) setPosts(postsRes.data.posts || []);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // Reload when the viewer logs in/out: visibility depends on who is looking
  }, [username, currentUser?.id]);

  if (loading) {
    return (
      <Layout>
        <div className="p-20 text-center text-muted-foreground">Loading profile...</div>
      </Layout>
    );
  }

  if (notFound || !profile) {
    return (
      <Layout>
        <div className="p-20 text-center">
          <h1 className="font-display text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground">There is no active user called "{username}".</p>
        </div>
      </Layout>
    );
  }

  // Locked profile: private, or members-only while logged out
  if (restricted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="glass-card p-8 text-center">
            <img
              src={profile.avatar || fallbackAvatar(profile.username)}
              alt={profile.username}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover opacity-80"
            />
            <h1 className="font-display text-2xl font-bold mb-4">{profile.username}</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Lock className="w-4 h-4" />
              <span>
                {restricted === 'members'
                  ? 'This profile is only visible to logged-in members.'
                  : 'This profile is private.'}
              </span>
            </div>
            {restricted === 'members' && (
              <Link to="/login">
                <Button>Log in to view</Button>
              </Link>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username;

  const stats = [
    { label: 'Level', value: profile.level || 1, icon: Trophy },
    { label: 'Posts', value: profile.postsCount || 0, icon: FileText },
    { label: 'Comments', value: profile.commentsCount || 0, icon: MessageSquare },
    { label: 'Likes received', value: profile.likesReceived || 0, icon: ThumbsUp },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column: user card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-background ring-2 ring-primary/20">
                <img
                  src={profile.avatar || fallbackAvatar(profile.username)}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackAvatar(profile.username);
                  }}
                />
              </div>
              <h1 className="font-display text-2xl font-bold mb-1">{profile.username}</h1>
              <p className="text-primary font-medium mb-4 capitalize">{profile.role}</p>

              {isOwnProfile && (
                <Link to="/profile/edit">
                  <Button variant="outline" className="w-full gap-2">
                    <Settings className="w-4 h-4" /> Edit Profile
                  </Button>
                </Link>
              )}
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>

              {profile.lastSeen && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Last active {timeAgo(profile.lastSeen)}</span>
                </div>
              )}

              {profile.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="break-all">{profile.email}</span>
                </div>
              )}

              <div className="text-sm text-muted-foreground pt-4 border-t border-border">
                {profile.bio ? (
                  profile.bio
                ) : isOwnProfile ? (
                  <Link to="/profile/edit" className="text-primary hover:underline">
                    Add a bio
                  </Link>
                ) : (
                  'No bio yet.'
                )}
              </div>
            </div>
          </div>

          {/* Right column: stats + posts */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="glass-card p-4 text-center">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-bold mb-4">Recent Posts</h2>

              {!profile.canViewActivity ? (
                <p className="text-center text-muted-foreground py-8 flex items-center justify-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  {profile.username} keeps their activity private.
                </p>
              ) : posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {isOwnProfile
                    ? "You haven't posted anything yet."
                    : `${profile.username} hasn't posted anything yet.`}
                </p>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/forum/${post._id}`}
                      className="block p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1 text-xs">
                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary capitalize">
                          {post.postType}
                        </span>
                        {post.game?.title && (
                          <span className="text-muted-foreground">in {post.game.title}</span>
                        )}
                        <span className="text-muted-foreground ml-auto">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold">{post.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" /> {post.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" /> {post.commentsCount || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;