import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export const KeyGeneratePage: React.FC = () => {
  const { navigate } = useApp();
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTarget = searchParams.get('redirect') || '/study';
  const accessType = searchParams.get('type') || 'full';

  const [countdown, setCountdown] = useState<number>(3);
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    // 3 second auto-verification timer matching learnxpw.site key-generate bypass
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setVerified(true);
          setTimeout(() => {
            navigate(redirectTarget);
          }, 600);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, redirectTarget]);

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1222] p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
          <KeyRound className="h-8 w-8 animate-pulse" />
        </div>

        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
          Direct Access Authorized
        </span>

        <h1 className="mt-3 text-xl font-bold text-white">Generating Student Access Pass</h1>
        <p className="mt-1 text-xs text-slate-400">
          Verifying key tokens for <span className="font-semibold text-slate-200">{accessType}</span> access...
        </p>

        <div className="my-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span>Security Verification</span>
            <span className="font-mono text-purple-300 font-bold">100% Complete</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>
        </div>

        {verified ? (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Key Generated! Redirecting to study course...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            <span>Redirecting automatically in {countdown}s...</span>
          </div>
        )}

        <button
          onClick={() => navigate(redirectTarget)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-xs font-bold text-white shadow-lg shadow-purple-900/30 hover:bg-purple-500 transition cursor-pointer"
        >
          <span>Continue to Batch Now</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
