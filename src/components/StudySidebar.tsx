import React from 'react';
import { useApp } from '../context/AppContext';
import { SERVER_CONFIG } from '../api/client';
import {
  BookOpen,
  Compass,
  GraduationCap,
  Sparkles,
  Trophy,
  Flame,
  Award,
  Bookmark,
  Clock,
  Send,
  Mail,
  ChevronRight,
  X
} from 'lucide-react';

interface StudySidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const StudySidebar: React.FC<StudySidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { currentPath, navigate, enrolledBatches } = useApp();

  const menuItems = [
    { text: 'Study', href: '/study', icon: BookOpen },
    { text: 'PI', href: '/study/pi', icon: Compass },
    { text: 'Batches', href: '/study/batches', icon: GraduationCap },
    { text: 'Next Toppers', href: '/study/nexttoppers', icon: Trophy },
    { text: 'MissionJeet', href: '/study/missionjeet', icon: Flame },
    { text: 'Vibrant', href: '/study/vibrant', icon: Award },
    { text: 'Selection Way', href: '/study/sway', icon: Sparkles },
    {
      text: 'My Batches',
      href: '/study/mybatches',
      icon: Bookmark,
      count: enrolledBatches.length > 0 ? enrolledBatches.length : undefined,
    },
    { text: 'History', href: '/history', icon: Clock },
    { text: 'Join Telegram', href: SERVER_CONFIG.tg_channel, icon: Send, isExternal: true },
    { text: 'Contact Us', href: '/contact', icon: Mail },
  ];

  const content = (
    <div className="flex h-full flex-col justify-between bg-[#0a0e1c] border-r border-white/10 w-64 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0a0e1c] z-10 flex items-center justify-between">
          <button
            onClick={() => {
              navigate('/study');
              onCloseMobile?.();
            }}
            className="flex items-center gap-3 text-left transition hover:opacity-90 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
              <img
                src={SERVER_CONFIG.sidebarLogoUrl}
                alt="Learnxpw logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-semibold text-white">Learnxpw</span>
            <GraduationCap className="w-5 h-5 text-[#5a4bda]" />
          </button>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-2 overflow-y-auto h-[calc(100vh-5rem)]">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isMatch =
              item.href === '/study'
                ? currentPath === '/study'
                : currentPath.startsWith(item.href);

            if (item.isExternal) {
              return (
                <a
                  key={item.text}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-slate-300 gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-colors duration-200 hover:bg-white/[0.08]"
                >
                  <Icon className="w-5 h-5 flex-shrink-0 text-[#5a4bda]" />
                  <span>{item.text}</span>
                </a>
              );
            }

            return (
              <button
                key={item.text}
                onClick={() => {
                  navigate(item.href);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-sm transition-colors duration-200 text-left ${
                  isMatch
                    ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isMatch ? 'text-white' : 'text-[#5a4bda]'}`} />
                <span className="flex-1 truncate">{item.text}</span>
                {item.count !== undefined && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/[0.08] p-4 text-[11px] text-slate-500 text-center">
        <p className="font-medium text-slate-400">{SERVER_CONFIG.webName}</p>
        <p className="mt-0.5 text-[10px]">Open Study Platform</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};
