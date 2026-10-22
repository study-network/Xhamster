import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SERVER_CONFIG } from '../api/client';
import {
  Menu,
  X,
  Send,
  BookOpen,
  GraduationCap,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Compass,
  Bookmark
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPath, navigate, enrolledBatches } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Batches', icon: GraduationCap, href: '/study/batches', badge: 'All Batches' },
    { label: 'PI Course Feed', icon: Compass, href: '/study/pi', badge: 'PW NSAT' },
    {
      label: 'My Batches',
      icon: Bookmark,
      href: '/study/mybatches',
      badge: enrolledBatches.length > 0 ? String(enrolledBatches.length) : undefined,
    },
    { label: 'Watch History', icon: Clock, href: '/history' },
    { label: 'Contact Us', icon: ShieldCheck, href: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080b18]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-slate-300 hover:text-white lg:hidden rounded-lg hover:bg-white/[0.05]"
              title="Open Navigation Menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 transition hover:opacity-95 text-left cursor-pointer"
            >
              <img
                src={SERVER_CONFIG.sidebarLogoUrl}
                alt="Learnxpw logo"
                className="h-10 w-10 rounded-xl object-contain shadow-lg shadow-purple-500/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-white">{SERVER_CONFIG.webName}</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="hidden sm:block text-[10px] text-purple-300 font-medium">Free Learning Portal</p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => navigate('/')}
              className={`transition hover:text-white cursor-pointer ${
                currentPath === '/' ? 'text-purple-400 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/study/batches')}
              className={`flex items-center gap-1.5 transition hover:text-white cursor-pointer ${
                currentPath.startsWith('/study/batches') ? 'text-purple-400 font-semibold' : ''
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Batches</span>
            </button>
            <button
              onClick={() => navigate('/study/pi')}
              className={`flex items-center gap-1.5 transition hover:text-white cursor-pointer ${
                currentPath.startsWith('/study/pi') ? 'text-purple-400 font-semibold' : ''
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>PI Videos</span>
            </button>
            <button
              onClick={() => navigate('/study/mybatches')}
              className={`flex items-center gap-1.5 transition hover:text-white cursor-pointer ${
                currentPath.startsWith('/study/mybatches') ? 'text-purple-400 font-semibold' : ''
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>My Batches</span>
              {enrolledBatches.length > 0 && (
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                  {enrolledBatches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/history')}
              className={`flex items-center gap-1.5 transition hover:text-white cursor-pointer ${
                currentPath.startsWith('/history') ? 'text-purple-400 font-semibold' : ''
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>History</span>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className={`transition hover:text-white cursor-pointer ${
                currentPath.startsWith('/contact') ? 'text-purple-400 font-semibold' : ''
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href={SERVER_CONFIG.tg_channel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Join Telegram</span>
            </a>

            {currentPath === '/' ? (
              <button
                onClick={() => navigate('/study/batches')}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-blue-500 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Open App</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/study/batches')}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/[0.1] transition flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                <span>Browse Batches</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>

          <div className="relative z-10 w-72 max-w-[80vw] bg-[#0b0e1b] border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={SERVER_CONFIG.sidebarLogoUrl}
                    alt="Learnxpw"
                    className="h-8 w-8 rounded-lg object-contain"
                  />
                  <span className="font-bold text-base text-white">{SERVER_CONFIG.webName}</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate('/');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-left transition cursor-pointer ${
                    currentPath === '/' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <span>Home</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </button>

                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPath.startsWith(item.href);
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-purple-300" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-purple-200">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <a
                  href={SERVER_CONFIG.bookLibrary}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/[0.04] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-cyan-300" />
                    <span>Book Library</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                </a>
              </div>
            </div>

            <div className="border-t border-white/[0.08] pt-4 mt-4">
              <a
                href={SERVER_CONFIG.tg_channel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-500/20 py-2.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Join Official Telegram</span>
              </a>
              <p className="mt-2 text-center text-[10px] text-slate-500">Learnxpw • Zero Login Study Space</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
