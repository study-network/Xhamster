import React from 'react';
import { useApp } from '../context/AppContext';
import { SERVER_CONFIG } from '../api/client';
import { Send, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useApp();

  return (
    <footer className="border-t border-white/[0.06] bg-[#050711]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={SERVER_CONFIG.sidebarLogoUrl}
                alt="Learnxpw"
                className="h-9 w-9 rounded-xl object-contain shadow-md shadow-purple-500/20"
              />
              <span className="text-xl font-bold tracking-tight text-white">{SERVER_CONFIG.webName}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-slate-400 leading-relaxed">
              Learnxpw brings video lectures, syllabus schedules, live classes, batches and study resources into one clean, open learning space.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Free Open Learning • No Login Required</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/study/batches')} className="hover:text-white transition cursor-pointer">
                  All Batches
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/study/pi')} className="hover:text-white transition cursor-pointer">
                  PI Feed
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/study/mybatches')} className="hover:text-white transition cursor-pointer">
                  My Enrolled Batches
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/history')} className="hover:text-white transition cursor-pointer">
                  Watch History
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300">Resources</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href={SERVER_CONFIG.bookLibrary}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Book Library</span>
                  <ExternalLink className="h-3 w-3 text-slate-500" />
                </a>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition cursor-pointer">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300">Community & Bot</h4>
            <div className="mt-4 space-y-3 text-sm">
              <a
                href={SERVER_CONFIG.tg_channel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition"
              >
                <Send className="h-4 w-4" />
                <span>Join Telegram</span>
              </a>
              <div className="text-xs text-slate-500">
                Official Bot: <span className="text-slate-300 font-mono">{SERVER_CONFIG.tg_bot}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-7 text-xs text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src={SERVER_CONFIG.sidebarLogoUrl} alt="" className="h-6 w-6 rounded-md object-contain" />
            <span className="font-semibold text-slate-400">Learnxpw</span>
          </div>
          <p>© 2026 Learnxpw. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for passionate learners
          </p>
        </div>
      </div>
    </footer>
  );
};
