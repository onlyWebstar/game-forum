// pages/EditProfile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, X, User, Mail, FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

const EditProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, avatar: url });
    setAvatarPreview(url);
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (formData.username.length > 30) {
      newErrors.username = 'Username must be less than 30 characters';
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    if (formData.avatar && !isValidUrl(formData.avatar)) {
      newErrors.avatar = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/users/profile', {
        username: formData.username,
        bio: formData.bio,
        avatar: formData.avatar,
      });

      if (response.data.success) {
        // Update local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const updatedUser = {
            ...JSON.parse(storedUser),
            ...response.data.user,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });

        // Refresh page to update context
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${user?.username}`);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold">Edit Profile</h1>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="font-semibold text-lg mb-4">Profile Picture</h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <img
                    src={avatarPreview || 'https://ui-avatars.com/api/?background=6366f1&color=fff&name=' + formData.username}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${formData.username}`;
                    }}
                  />
                  <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium mb-2">Avatar URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={handleAvatarChange}
                  />
                  {errors.avatar && (
                    <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter a direct URL to an image. Recommended size: 400x400px
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="glass-card p-6 rounded-lg space-y-4">
              <h2 className="font-semibold text-lg mb-4">Basic Information</h2>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="w-4 h-4" />
                  Username
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  3-30 characters. Letters, numbers, and underscores only.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                  className="opacity-60 cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <FileText className="w-4 h-4" />
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full h-32 px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-red-500 text-sm">{errors.bio}</p>
                  )}
                  <p className="text-sm text-muted-foreground ml-auto">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Stats (Read-only) */}
            <div className="glass-card p-6 rounded-lg">
              <h2 className="font-semibold text-lg mb-4">Account Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.level || 1}</div>
                  <div className="text-sm text-muted-foreground">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.experience || 0}</div>
                  <div className="text-sm text-muted-foreground">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(user as any).postsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {(user as any).commentsCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Additional Help */}
          <div className="mt-8 glass-card p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Changes to your username may take a few moments to reflect
              across the site. Your old username will become available for others to use.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;