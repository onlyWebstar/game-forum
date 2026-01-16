// pages/Settings.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bell, Shield, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'password' | 'notifications' | 'privacy' | 'account'>('password');

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Password</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'privacy'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Privacy</span>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'account'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Account</span>
              </button>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {activeTab === 'password' && <PasswordSection />}
              {activeTab === 'notifications' && <NotificationsSection />}
              {activeTab === 'privacy' && <PrivacySection />}
              {activeTab === 'account' && <AccountSection />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Password Section
const PasswordSection: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="font-display text-xl font-bold mb-4">Change Password</h2>
      <p className="text-muted-foreground mb-6">
        Update your password to keep your account secure
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Password</label>
          <div className="relative">
            <Input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <div className="relative">
            <Input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
          <div className="relative">
            <Input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
};

// Notifications Section
const NotificationsSection: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    postReplies: true,
    newFollowers: true,
    gameLaunches: false,
    weeklyDigest: true,
  });

  const handleSave = () => {
    toast({
      title: 'Success',
      description: 'Notification preferences updated',
    });
  };

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="font-display text-xl font-bold mb-4">Notification Preferences</h2>
      <p className="text-muted-foreground mb-6">
        Choose what notifications you want to receive
      </p>

      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">Email Notifications</div>
            <div className="text-sm text-muted-foreground">Receive updates via email</div>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">Post Replies</div>
            <div className="text-sm text-muted-foreground">When someone replies to your posts</div>
          </div>
          <input
            type="checkbox"
            checked={settings.postReplies}
            onChange={(e) => setSettings({ ...settings, postReplies: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">New Followers</div>
            <div className="text-sm text-muted-foreground">When someone follows you</div>
          </div>
          <input
            type="checkbox"
            checked={settings.newFollowers}
            onChange={(e) => setSettings({ ...settings, newFollowers: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">Game Launches</div>
            <div className="text-sm text-muted-foreground">New releases from favorite games</div>
          </div>
          <input
            type="checkbox"
            checked={settings.gameLaunches}
            onChange={(e) => setSettings({ ...settings, gameLaunches: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">Weekly Digest</div>
            <div className="text-sm text-muted-foreground">Weekly summary of top posts</div>
          </div>
          <input
            type="checkbox"
            checked={settings.weeklyDigest}
            onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <Button onClick={handleSave} className="mt-4">
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

// Privacy Section
const PrivacySection: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true,
    allowMessages: true,
  });

  const handleSave = () => {
    toast({
      title: 'Success',
      description: 'Privacy settings updated',
    });
  };

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="font-display text-xl font-bold mb-4">Privacy Settings</h2>
      <p className="text-muted-foreground mb-6">
        Control who can see your information
      </p>

      <div className="space-y-6">
        <div>
          <label className="block font-medium mb-2">Profile Visibility</label>
          <select
            value={settings.profileVisibility}
            onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background"
          >
            <option value="public">Public - Anyone can see</option>
            <option value="members">Members Only</option>
            <option value="private">Private - Only you</option>
          </select>
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">Show Email Address</div>
            <div className="text-sm text-muted-foreground">Display email on your profile</div>
          </div>
          <input
            type="checkbox"
            checked={settings.showEmail}
            onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">Show Activity</div>
            <div className="text-sm text-muted-foreground">Let others see your recent activity</div>
          </div>
          <input
            type="checkbox"
            checked={settings.showActivity}
            onChange={(e) => setSettings({ ...settings, showActivity: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <div className="font-medium">Allow Direct Messages</div>
            <div className="text-sm text-muted-foreground">Let other users message you</div>
          </div>
          <input
            type="checkbox"
            checked={settings.allowMessages}
            onChange={(e) => setSettings({ ...settings, allowMessages: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </label>

        <Button onClick={handleSave} className="mt-4">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

// Account Section
const AccountSection: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
    if (doubleConfirm !== 'DELETE') {
      toast({
        title: 'Cancelled',
        description: 'Account deletion cancelled',
      });
      return;
    }

    try {
      await api.delete('/users/account');
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted',
      });
      logout();
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="font-display text-xl font-bold mb-4 text-red-500">Danger Zone</h2>
      <p className="text-muted-foreground mb-6">
        Irreversible actions that affect your account
      </p>

      <div className="border-2 border-red-500/20 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Delete Account</h3>
          <p className="text-muted-foreground mb-4">
            Once you delete your account, there is no going back. All your posts, comments, and data
            will be permanently removed.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;