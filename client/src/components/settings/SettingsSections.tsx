// components/settings/SettingsSections.tsx
import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';

/* ---------- small building blocks ---------- */

const Toggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
      checked ? 'bg-primary' : 'bg-muted'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const Row: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
    <Toggle checked={checked} onChange={onChange} label={title} />
  </div>
);

const DEFAULT_NOTIFICATIONS = { comments: true, replies: true, likes: true };
const DEFAULT_PRIVACY = {
  profileVisibility: 'public' as 'public' | 'members' | 'private',
  showEmail: false,
  showActivity: true,
};

// Loads the saved settings once, and saves changes
const useSettings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [privacy, setPrivacy] = useState(DEFAULT_PRIVACY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/users/settings')
      .then(({ data }) => {
        if (cancelled) return;
        setNotifications({ ...DEFAULT_NOTIFICATIONS, ...data.notificationSettings });
        setPrivacy({ ...DEFAULT_PRIVACY, ...data.privacy });
      })
      .catch(() =>
        toast({
          title: 'Could not load your settings',
          description: 'Showing defaults. Try refreshing the page.',
          variant: 'destructive',
        })
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (body: object, successMessage: string) => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/settings', body);
      setNotifications({ ...DEFAULT_NOTIFICATIONS, ...data.notificationSettings });
      setPrivacy({ ...DEFAULT_PRIVACY, ...data.privacy });
      toast({ title: 'Saved', description: successMessage });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Could not save your settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return { notifications, setNotifications, privacy, setPrivacy, loading, saving, save };
};

/* ---------- Notifications ---------- */

export const NotificationSettings: React.FC = () => {
  const { notifications, setNotifications, loading, saving, save } = useSettings();

  if (loading) {
    return <div className="glass-card p-6 rounded-lg text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="font-display text-xl font-bold mb-2">Notification Preferences</h2>
      <p className="text-muted-foreground mb-6">
        Choose which activity shows up under the bell in the menu.
      </p>

      <div className="space-y-5">
        <Row
          title="Comments on my posts"
          description="When someone comments on a post you wrote"
          checked={notifications.comments}
          onChange={(v) => setNotifications({ ...notifications, comments: v })}
        />
        <Row
          title="Replies to my comments"
          description="When someone replies to a comment you wrote"
          checked={notifications.replies}
          onChange={(v) => setNotifications({ ...notifications, replies: v })}
        />
        <Row
          title="Likes"
          description="When someone likes your posts or comments"
          checked={notifications.likes}
          onChange={(v) => setNotifications({ ...notifications, likes: v })}
        />

        <p className="text-xs text-muted-foreground">
          Turning a type off only stops new notifications. Ones you already have stay in your list.
          Email notifications aren't available yet.
        </p>

        <Button
          onClick={() =>
            save({ notificationSettings: notifications }, 'Notification preferences updated')
          }
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

/* ---------- Privacy ---------- */

export const PrivacySettings: React.FC = () => {
  const { privacy, setPrivacy, loading, saving, save } = useSettings();

  if (loading) {
    return <div className="glass-card p-6 rounded-lg text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="glass-card p-6 rounded-lg">
      <h2 className="font-display text-xl font-bold mb-2">Privacy Settings</h2>
      <p className="text-muted-foreground mb-6">Control who can see your profile page.</p>

      <div className="space-y-6">
        <div>
          <label className="block font-medium mb-2" htmlFor="visibility">
            Profile visibility
          </label>
          <select
            id="visibility"
            value={privacy.profileVisibility}
            onChange={(e) =>
              setPrivacy({ ...privacy, profileVisibility: e.target.value as typeof privacy.profileVisibility })
            }
            className="w-full px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground"
          >
            <option value="public">Public - anyone can see my profile</option>
            <option value="members">Members only - only logged-in users</option>
            <option value="private">Private - only me (and site moderators)</option>
          </select>
        </div>

        <Row
          title="Show my email address"
          description="Display your email on your profile"
          checked={privacy.showEmail}
          onChange={(v) => setPrivacy({ ...privacy, showEmail: v })}
        />
        <Row
          title="Show my activity"
          description="Show your recent posts and when you were last active on your profile"
          checked={privacy.showActivity}
          onChange={(v) => setPrivacy({ ...privacy, showActivity: v })}
        />

        <p className="text-xs text-muted-foreground">
          These settings apply to your profile page. Posts and comments you publish in the forum are
          public and still show your username and avatar. Site moderators can always view profiles.
        </p>

        <Button onClick={() => save({ privacy }, 'Privacy settings updated')} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};