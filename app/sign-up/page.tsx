'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SignUp } from '@clerk/nextjs';
import { Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl">👤</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          </div>
          
          <SignUp 
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}