import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'KOMIK2 - Digital Comics Platform',
  description: 'Temukan dan baca webtoon favoritmu dengan pengalaman membaca yang elegan.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KOMIK2',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="bg-[#0a0a0a] text-white font-space antialiased">
        {children}
        <BugReport />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW Registered: ', registration.scope);
                  }, function(err) {
                    console.log('SW Registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

// ========== KOMPONEN BUG REPORT ==========
'use client';

import { useState, useEffect } from 'react';
import { Bug, X, Send, Mail, AlertCircle, CheckCircle } from 'lucide-react';

function BugReport() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      setError('Mohon isi semua field yang wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const email = 'komik2web@gmail.com';
    const body = `
🐞 LAPORAN BUG KOMIK2
═══════════════════════

📝 Judul: ${subject}
📄 Deskripsi: ${description}
🔗 URL: ${url || 'Tidak disebutkan'}
📱 User-Agent: ${navigator.userAgent}
📅 Tanggal: ${new Date().toLocaleString('id-ID')}

═══════════════════════
Dilaporkan dari aplikasi KOMIK2
    `;

    const mailtoLink = `mailto:${email}?subject=[BUG] ${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      setSubject('');
      setDescription('');
      setUrl('');
      setIsOpen(false);
    }, 3000);
  };

  if (!isMounted) return null;

  return (
    <>
      {/* TOMBOL LAPOR BUG - VERSI MOBILE (DI ATAS NAV) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 group flex items-center gap-2 border border-white/20"
        aria-label="Lapor Bug"
      >
        <Bug size={16} className="group-hover:rotate-12 transition-transform" />
        <span>Lapor Bug</span>
      </button>

      {/* TOMBOL LAPOR BUG - VERSI DESKTOP (POJOK KANAN BAWAH) */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-[9999] p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105 group items-center gap-2 border border-white/20"
        aria-label="Lapor Bug"
      >
        <Bug size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-medium">Lapor Bug</span>
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#0a0a0a] z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20">
                  <Bug size={18} className="text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Lapor Bug</h2>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError('');
                  setIsSuccess(false);
                }}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                    <CheckCircle size={32} className="text-green-400" />
                  </div>
                  <p className="text-white font-medium">Terima kasih!</p>
                  <p className="text-white/40 text-sm font-mono mt-1">
                    Email client akan terbuka. Silakan kirim laporanmu.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">
                      Judul Bug <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Contoh: Gambar tidak muncul"
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">
                      Deskripsi Bug <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan secara detail bug yang kamu temukan..."
                      rows={4}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-colors resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1.5">
                      URL Halaman (opsional)
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://komik2.com/..."
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Mail size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/40">
                      Laporan akan dikirim ke{' '}
                      <span className="text-blue-400 font-mono">komik2web@gmail.com</span>
                      <br />
                      Email client akan terbuka secara otomatis.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setError('');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors font-medium"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Kirim Laporan
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
