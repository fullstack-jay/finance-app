'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signUp } from '@/lib/auth-client';
import { Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

// This component will fetch the user count in the background after page load
const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userCount, setUserCount] = useState<number | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  // Fetch user count after component mounts
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/user-count');
        if (response.ok) {
          const data = await response.json();
          setUserCount(data.count);
        } else {
          // Default to a reasonable number if API fails
          setUserCount(5000);
        }
      } catch (err) {
        // Default to a reasonable number if API fails
        setUserCount(5000);
      }
    };

    fetchUserCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Sign up failed');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Format the number with commas (e.g., 10000 becomes "10,000")
  const formattedUserCount = userCount ? userCount.toLocaleString() : 'thousands of';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Left side - Full image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-500 to-yellow-500 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200')] bg-cover bg-center opacity-80"></div>
        <div className="relative z-10 text-center text-white p-8">
          <div className="mx-auto bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <div className="text-6xl">👤</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm px-6 py-4 rounded-lg inline-block">
            <p className="text-2xl max-w-md">{t('join_users_managing_finances').replace('{count}', formattedUserCount)}</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Sign Up Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <div className="text-2xl">👤</div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800">{t('create_account')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">{t('full_name')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={t('enter_your_full_name')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 text-gray-900 placeholder-gray-500 dark:text-gray-900 dark:placeholder-gray-500 border-black dark:border-black"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('enter_your_email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 text-gray-900 placeholder-gray-500 dark:text-gray-900 dark:placeholder-gray-500 border-black dark:border-black"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">{t('password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('create_strong_password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 pr-10 h-12 text-gray-900 placeholder-gray-500 dark:text-gray-900 dark:placeholder-gray-500 border-black dark:border-black"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    {t('i_agree_to')} <Link href="/terms" className="text-amber-600 hover:underline">{t('terms_of_service')}</Link> {t('and')} <Link href="/privacy" className="text-amber-600 hover:underline">{t('privacy_policy')}</Link>
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('creating_account')}...
                    </>
                  ) : (
                    t('sign_up')
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <div className="text-center text-sm text-gray-600">
                {t('already_have_account')}{' '}
                <Link href="/sign-in" className="font-medium text-amber-600 hover:underline">
                  {t('sign_in')}
                </Link>
              </div>
              <Link href="/" className="text-sm text-amber-600 hover:underline">
                ← {t('back_to_home')}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;