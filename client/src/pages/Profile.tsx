import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Link as LinkIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
  const { username } = useParams(); // Get username from URL
  const { user: currentUser } = useAuth(); // Get logged in user
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If viewing own profile, use current user data
        // Otherwise, fetch from public profile API (which you need to ensure exists in backend)
        // For now, let's assume we fetch by username
        const { data } = await api.get(`/users/${username}`);
        setProfileData(data.user);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username]);

  if (loading) return <Layout><div className="p-20 text-center">Loading Profile...</div></Layout>;
  if (!profileData) return <Layout><div className="p-20 text-center">User not found</div></Layout>;

  const isOwnProfile = currentUser?.username === profileData.username;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-background ring-2 ring-primary/20">
                <img src={profileData.avatar} alt={profileData.username} className="w-full h-full object-cover" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-1">{profileData.username}</h1>
              <p className="text-primary font-medium mb-4 capitalize">{profileData.role}</p>
              
              {/* Only show Settings/Edit if it is YOUR profile */}
              {isOwnProfile && (
                <Button variant="outline" className="w-full gap-2" onClick={() => alert("Settings Modal implementation coming next!")}>
                  <Settings className="w-4 h-4" /> Edit Profile
                </Button>
              )}
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profileData.createdAt).toLocaleDateString()}</span>
              </div>
              {profileData.bio && (
                 <p className="text-sm text-muted-foreground pt-4 border-t border-border">
                   {profileData.bio}
                 </p>
              )}
            </div>
          </div>

          {/* Activity Feed Area */}
          <div className="lg:col-span-3">
             <div className="glass-card p-8 text-center text-muted-foreground">
                {profileData.username} hasn't posted anything yet.
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;