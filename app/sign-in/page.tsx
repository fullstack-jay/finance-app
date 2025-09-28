'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signIn } from '@/lib/auth-client';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Sign in failed');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Left side - Full image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-500 to-yellow-500 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200')] bg-cover bg-center opacity-80"></div>
        <div className="relative z-10 text-center text-white p-8">
          <div className="mx-auto bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <div className="text-6xl">🔐</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm px-6 py-4 rounded-lg inline-block">
            <p className="text-2xl max-w-md">{t('secure_access_to_financial_data')}</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Sign In Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <div className="text-2xl">🔐</div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-800">{t('welcome_back')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
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
                      placeholder={t('enter_your_password')}
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
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600">{t('remember_me')}</label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-amber-600 hover:underline">
                    {t('forgot_password')}
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('signing_in')}...
                    </>
                  ) : (
                    t('sign_in')
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <div className="text-center text-sm text-gray-600">
                {t('already_have_account')}{' '}
                <Link href="/sign-up" className="font-medium text-amber-600 hover:underline">
                  {t('sign_up')}
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
}