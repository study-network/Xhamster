import React, { useState } from 'react';
import { StudySidebar } from './StudySidebar';
import { SERVER_CONFIG } from '../api/client';
import { Menu, Send, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navigate } = useApp();

  return (
    <div className="flex min-h-screen bg-[#080b18] text-white">
      {/* Sidebar */}
      <StudySidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Wrapper */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Mobile Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#080b18]/90 backdrop-blur-md px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05]"
              title="Open Navigation"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-left"
            >
              <img
                src={SERVER_CONFIG.sidebarLogoUrl}
                alt="Learnxpw"
                className="h-8 w-8 rounded-lg object-contain"
              />
              <span className="font-bold text-sm text-white">{SERVER_CONFIG.webName}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={SERVER_CONFIG.tg_channel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Telegram</span>
            </a>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
};
