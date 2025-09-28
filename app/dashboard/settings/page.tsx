'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/lib/auth-client';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isPending && session) {
      fetchProfile();
    }
  }, [isPending, session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        toast.error(t('error_fetching_profile'));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('error_fetching_profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          image: profile.image,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        toast.success(t('profile_updated_successfully'));
      } else {
        const error = await response.json();
        toast.error(error.error || t('error_updating_profile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('error_updating_profile'));
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('passwords_do_not_match'));
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        toast.success(t('password_updated_successfully'));
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        toast.error(error.error || t('error_updating_password'));
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(t('error_updating_password'));
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (url: string) => {
    setProfile(prev => prev ? { ...prev, image: url } : null);
    toast.success(t('profile_picture_updated'));
  };

  if (loading || isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <h2 className="text-lg font-medium text-destructive">{t('profile_not_found')}</h2>
        <Button onClick={fetchProfile} className="mt-4">
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('settings')}</h1>
          <p className="text-muted-foreground">
            {t('manage_your_account_settings')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile_information')}</CardTitle>
              <CardDescription>
                {t('update_your_profile_information')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex items-center gap-4">
                  {profile.image ? (
                    <img 
                      src={profile.image} 
                      alt={profile.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-secondary"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-lg font-medium border-2 border-secondary">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">{t('profile_picture')}</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          
                          // Create FormData to send the file
                          const formData = new FormData();
                          formData.append('image', file);
                          
                          try {
                            // Upload image to a service (this would need to be implemented)
                            // Since we don't have a proper image upload service, we'll simulate
                            // showing how this would be done with a proper service
                            
                            // For now, create a temporary URL for the selected image
                            const tempUrl = URL.createObjectURL(file);
                            
                            // Update the profile image with the temp URL
                            setProfile(prev => prev ? { ...prev, image: tempUrl } : null);
                            
                            // Show info that this is a temporary preview
                            toast.info(t('image_preview_updated'));
                            
                            // In a real implementation, you would upload to a service like:
                            // const response = await fetch('/api/upload', {
                            //   method: 'POST',
                            //   body: formData,
                            // });
                            // const result = await response.json();
                            // setProfile(prev => prev ? { ...prev, image: result.url } : null);
                          } catch (error) {
                            console.error('Error processing image:', error);
                            toast.error(t('error_processing_image'));
                          }
                        }
                      }} 
                    />
                    <p className="text-xs text-muted-foreground">{t('supported_formats')}: JPG, PNG, WEBP</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">{t('full_name')}</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder={t('enter_your_full_name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('email_address')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder={t('enter_your_email')}
                  />
                </div>

                
                
                <Button type="submit" disabled={updating}>
                  {updating ? t('updating') : t('update_profile')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('change_password')}</CardTitle>
              <CardDescription>
                {t('change_your_password_here')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('current_password')}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder={t('enter_your_current_password')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('new_password')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder={t('enter_your_new_password')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirm_new_password')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder={t('confirm_your_new_password')}
                  />
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? t('updating') : t('change_password')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with additional settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('account')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-sm font-medium">{t('member_since')}</Label>
                <p className="text-muted-foreground">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('last_updated')}</Label>
                <p className="text-muted-foreground">
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add more settings sections as needed */}
          <Card>
            <CardHeader>
              <CardTitle>{t('security')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {t('two_factor_authentication')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}