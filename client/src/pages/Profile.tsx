import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  MessageSquare,
  ThumbsUp,
  Clock,
  Settings,
  Star,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';

// Mock user data
const userData = {
  username: 'GamerPro',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro',
  bio: 'Passionate gamer since the NES era. Currently obsessed with souls-like games and JRPGs. Let\'s talk games!',
  joinDate: '2023-01-15',
  location: 'San Francisco, CA',
  website: 'https://gamerpro.dev',
  stats: {
    posts: 142,
    comments: 892,
    likes: 3421,
    followers: 567,
    following: 234,
  },
  level: 42,
  badges: ['Early Adopter', 'Top Contributor', 'Helpful', 'Game Expert'],
  favoriteGames: [
    { id: '1', name: 'Elden Ring', cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&h=280&fit=crop' },
    { id: '2', name: 'Baldur\'s Gate 3', cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=280&fit=crop' },
    { id: '3', name: 'Cyberpunk 2077', cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=280&fit=crop' },
  ],
};

// Mock activity data
const recentActivity = [
  {
    id: '1',
    type: 'post',
    title: 'Best builds for new Elden Ring DLC?',
    game: 'Elden Ring',
    likes: 342,
    comments: 89,
    timeAgo: '2h ago',
  },
  {
    id: '2',
    type: 'comment',
    title: 'Replied to: Cyberpunk 2.0 review',
    game: 'Cyberpunk 2077',
    likes: 45,
    timeAgo: '5h ago',
  },
  {
    id: '3',
    type: 'post',
    title: 'Hidden lore connections explained',
    game: 'Baldur\'s Gate 3',
    likes: 567,
    comments: 145,
    timeAgo: '1d ago',
  },
];

const Profile: React.FC = () => {
  const { username } = useParams();

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Card */}
            <div className="lg:w-80 shrink-0">
              <div className="glass-card p-6 sticky top-24">
                {/* Avatar & Level */}
                <div className="relative mb-6">
                  <img
                    src={userData.avatar}
                    alt={userData.username}
                    className="w-32 h-32 mx-auto rounded-full border-4 border-primary/50"
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground font-display font-bold text-sm rounded-full">
                    LVL {userData.level}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h1 className="font-display text-2xl font-bold mb-1">{userData.username}</h1>
                  <p className="text-sm text-muted-foreground">{userData.bio}</p>
                </div>

                {/* Info */}
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(userData.joinDate).toLocaleDateString()}
                  </div>
                  {userData.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {userData.location}
                    </div>
                  )}
                  {userData.website && (
                    <a
                      href={userData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {userData.website.replace('https://', '')}
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div>
                    <div className="font-display text-xl font-bold text-foreground">{userData.stats.posts}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-foreground">{userData.stats.followers}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-foreground">{userData.stats.following}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-md"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" variant="neon">Follow</Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Favorite Games */}
              <section>
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Favorite Games
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {userData.favoriteGames.map((game) => (
                    <Link
                      key={game.id}
                      to={`/games/${game.id}`}
                      className="game-card group"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                        <img
                          src={game.cover}
                          alt={game.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="font-display text-xs font-semibold text-foreground truncate">
                            {game.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Activity Feed */}
              <section>
                <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      to={`/forum/${activity.id}`}
                      className="glass-card p-4 block glow-hover group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          activity.type === 'post' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                        }`}>
                          {activity.type === 'post' ? (
                            <MessageSquare className="w-5 h-5" />
                          ) : (
                            <MessageSquare className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-md">
                              {activity.game}
                            </span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {activity.type}
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {activity.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {activity.likes}
                            </span>
                            {activity.comments && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {activity.comments}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.timeAgo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
