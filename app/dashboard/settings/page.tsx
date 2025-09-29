'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useClerk, UserResource } from '@clerk/nextjs';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';

import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { update } = useClerk();
  const { t } = useLanguage();
  const [updating, setUpdating] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-lg font-medium text-destructive">{t('not_authenticated')}</h2>
        <p className="text-muted-foreground mt-2">{t('please_sign_in_to_access_settings')}</p>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setUpdating(true);
    try {
      // Update user profile with Clerk
      await user.update({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      
      toast.success(t('profile_updated_successfully'));
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

    // Note: Changing password via Clerk requires additional implementation
    // For now we'll just show a message that this functionality would be added
    toast.info(t('password_change_functionality_not_implemented'));
    
    // Reset form
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        setUpdating(true);
        // Update user profile image using Clerk
        await user.setProfileImage({
          file,
        });
        
        toast.success(t('profile_picture_updated'));
      } catch (error) {
        console.error('Error updating profile image:', error);
        toast.error(t('error_processing_image'));
      } finally {
        setUpdating(false);
      }
    }
  };

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
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {user.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || 'User'} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-secondary"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-lg font-medium border-2 border-secondary">
                      {user.firstName?.[0]?.toUpperCase() || user.lastName?.[0]?.toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">{t('profile_picture')}</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-muted-foreground">{t('supported_formats')}: JPG, PNG, WEBP</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('first_name')}</Label>
                  <Input
                    id="firstName"
                    value={user.firstName || ''}
                    onChange={(e) => user.update({ firstName: e.target.value })}
                    placeholder={t('enter_your_first_name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('last_name')}</Label>
                  <Input
                    id="lastName"
                    value={user.lastName || ''}
                    onChange={(e) => user.update({ lastName: e.target.value })}
                    placeholder={t('enter_your_last_name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('email_address')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.emailAddresses[0]?.emailAddress || ''}
                    disabled
                    placeholder={t('enter_your_email')}
                  />
                </div>
              </div>
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
              <p className="text-xs text-muted-foreground mt-2">{t('password_change_note')}</p>
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
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">{t('last_updated')}</Label>
                <p className="text-muted-foreground">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
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
              <Button variant="outline" className="w-full" onClick={() => toast.info(t('tfa_functionality_not_implemented'))}>
                {t('two_factor_authentication')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}