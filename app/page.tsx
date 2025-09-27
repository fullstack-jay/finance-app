'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="text-5xl sm:text-6xl animate-bounce">💰</div>
              <div className="absolute -top-2 -right-2 text-xl sm:text-2xl animate-ping">✨</div>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-amber-700 mb-2">Tunggu Yaa Boss...</h2>
          <div className="h-2 w-40 sm:w-48 bg-amber-200 rounded-full overflow-hidden mx-auto mb-2">
            <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative overflow-hidden">
      {/* Image Section - Hidden on mobile, shown on medium screens and up */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-amber-50 to-yellow-100 items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="relative">
            <div className="text-6xl mb-8 animate-float">💼</div>
            <div className="text-6xl absolute -top-4 -right-4 animate-float">📈</div>
            <div className="text-6xl absolute -bottom-4 -left-4 animate-float" style={{animationDelay: '0.7s'}}>💰</div>
          </div>
          
          <div className="mt-12">
            {/* Single iPhone Replica with all features */}
            <div className="relative mx-auto" style={{ width: '365px', height: '727px' }}>
              <div className="bg-gray-800 rounded-[40px] p-4 shadow-2xl border-[10px] border-gray-900 relative w-full h-full">
                <div className="h-2 w-12 bg-gray-700 rounded-full mx-auto mb-3"></div>
                <div className="bg-gray-800 rounded-xl overflow-hidden h-[calc(100%-20px)]">
                  <div className="h-full p-3 overflow-y-auto">
                    <div className="space-y-4">
                      {/* Keamanan Terjamin */}
                      <div className="flex items-start space-x-4 p-4 bg-white/20 rounded-lg">
                        <div>
                        <div className="text-xl gold-accent animate-float">✅</div>
                          <h3 className="font-bold text-white text-sm">Keamanan Terjamin</h3>
                          <p className="text-xs text-slate-50">Perlindungan tingkat perusahaan untuk aset Anda</p>
                        </div>
                      </div>
                      
                      {/* Analisa Pertumbuhan */}
                      <div className="flex items-start space-x-4 p-4 bg-white/20 rounded-lg">
                        <div>
                        <div className="text-xl gold-accent animate-float" style={{animationDelay: '0.5s'}}>💡</div>
                          <h3 className="font-bold text-white text-sm">Analisa Pertumbuhan</h3>
                          <p className="text-xs text-slate-50">Insight lanjutan untuk memaksimalkan pengembalian Anda</p>
                        </div>
                      </div>
                      
                      {/* Manajemen Keuangan */}
                      <div className="flex items-start space-x-4 p-4 text-nowrap bg-white/20 rounded-lg">
                        <div >
                        <div className="text-xl gold-accent animate-float" style={{animationDelay: '0.5s'}}>📖</div>
                          <h3 className="font-bold text-white text-sm">Manajemen Keuangan</h3>
                          <p className="text-xs text-slate-50">Lacak dan optimalkan portofolio keuangan Anda</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="slide-up">
            <h1 className="gold-title text-left text-3xl md:text-4xl">
              Aplikasi Manajemen Keuangan Perusahaan
            </h1>
            <p className="text-base md:text-lg text-gray-700 mt-4 slide-up animate-text-pulse" style={{ animationDelay: '0.2s' }}>
              Solusi premium dan gratis untuk mengelola kekayaan, investasi, aset, dan pertumbuhan keuangan Anda.
            </p>
          </div>
          
          <div className="flex justify-between gap-4 pt-4 scale-in" style={{ animationDelay: '0.4s' }}>
            <Link 
              href="/sign-in" 
              className="gold-button hover:shadow-lg transition-all duration-300 flex items-center justify-center py-4 px-6 text-base font-medium flex-1 whitespace-nowrap"
            >
              Akses akun 
            </Link>
            <Link 
              href="/sign-up" 
              className="gold-button bg-gradient-to-r from-amber-500 to-yellow-600 hover:shadow-lg transition-all duration-300 flex items-center justify-center py-4 px-6 text-base font-medium flex-1 whitespace-nowrap"
            >
              Mulai Perjalanan Anda
            </Link>
          </div>
          
          {/* Mobile features - shown only on small screens */}
          <div className="grid grid-cols-1 gap-4 mt-8 md:hidden scale-in" style={{ animationDelay: '0.6s' }}>
            <div className="gold-card p-4 bg-white/90 border border-amber-200">
              <div className="flex justify-center mb-2">
                <div className="text-2xl gold-accent animate-float">💰</div>
              </div>
              <h3 className="text-lg font-bold text-amber-700 mb-1 text-center">Manajemen Keuangan</h3>
              <p className="text-sm text-amber-600 text-center">Lacak dan optimalkan portofolio keuangan Anda</p>
            </div>
            <div className="gold-card p-4 bg-white/90 border border-amber-200">
              <div className="flex justify-center mb-2">
                <div className="text-2xl gold-accent animate-float" style={{ animationDelay: '0.5s' }}>📈</div>
              </div>
              <h3 className="text-lg font-bold text-amber-700 mb-1 text-center">Analisa Pertumbuhan</h3>
              <p className="text-sm text-amber-600 text-center">Insight lanjutan untuk memaksimalkan pengembalian Anda</p>
            </div>
            <div className="gold-card p-4 bg-white/90 border border-amber-200">
              <div className="flex justify-center mb-2">
                <div className="text-2xl gold-accent animate-float" style={{ animationDelay: '1s' }}>🔐</div>
              </div>
              <h3 className="text-lg font-bold text-amber-700 mb-1 text-center">Keamanan Terjamin</h3>
              <p className="text-sm text-amber-600 text-center">Perlindungan tingkat perusahaan untuk aset Anda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}