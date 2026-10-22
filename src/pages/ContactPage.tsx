import React, { useState } from 'react';
import { SERVER_CONFIG } from '../api/client';
import { Mail, Send, Check, HelpCircle, Bot, ShieldCheck } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Batch Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', category: 'Batch Inquiry', message: '' });
    }, 4000);
  };

  const FAQS = [
    {
      q: "Do I need an account or login to access study batches?",
      a: "No! Learnxpw provides open learning access with zero login required. You can immediately access all video classes, lecture notes, DPP sheets, and schedules."
    },
    {
      q: "Can I adjust video speed and quality?",
      a: "Yes! Our custom built classroom player supports speed presets from 1x to 2.0x, 10-second skip shortcuts, and multiple resolution quality options."
    },
    {
      q: "Where can I get real-time lecture updates and announcements?",
      a: `Join our official Telegram Channel (${SERVER_CONFIG.tg_channel}) and use our verified Telegram Bot (${SERVER_CONFIG.tg_bot}) for daily updates and PDF alerts.`
    },
    {
      q: "Are the lecture notes and DPP practice sheets downloadable?",
      a: "Yes, each lecture includes one-click access to handwritten lecture summary slides and Daily Practice Problem (DPP) sets with answer keys."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-300 mb-3">
          <Mail className="h-4 w-4" />
          <span>Community & Help Center</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">Get in Touch with {SERVER_CONFIG.webName}</h1>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-400">
          Have questions regarding batch schedules, video lectures, or study materials? We are here to support your learning journey.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Contact Form */}
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-[#101524] p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">Send us a message</h2>
          <p className="mt-1 text-xs text-slate-400 mb-6">Fill out the form below and our team will reply within 24 hours.</p>

          {submitted ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-6 text-center">
              <Check className="mx-auto h-10 w-10 text-emerald-400" />
              <h3 className="mt-2 text-base font-bold text-white">Message Dispatched!</h3>
              <p className="mt-1 text-xs text-emerald-200">
                Thank you for reaching out. We have logged your inquiry and will follow up shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Inquiry Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#0e1324] px-4 py-2.5 text-sm text-white focus:border-purple-400 focus:outline-none"
                >
                  <option value="Batch Inquiry">Batch Inquiry & Syllabus</option>
                  <option value="Lecture Playback">Video Lecture Playback</option>
                  <option value="Notes & DPP">Notes & DPP PDF Download</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write details about your question..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-blue-500 transition cursor-pointer"
              >
                Send Inquiry
              </button>
            </form>
          )}
        </div>

        {/* Telegram & Bot Sidecards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-sky-500/20 bg-[#101930] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Telegram Community</h3>
                <p className="text-xs text-sky-300">Official Channel</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Join our Telegram channel to receive instant daily batch schedules, lecture links, and PDF note packets.
            </p>
            <a
              href={SERVER_CONFIG.tg_channel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-sky-400 transition"
            >
              <Send className="h-4 w-4" />
              <span>Join Official Telegram</span>
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101524] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Verified Study Bot</h3>
                <p className="text-xs text-purple-300">{SERVER_CONFIG.tg_bot}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Automated Telegram bot for lecture lookup, chapter revisions, and instant question solving support.
            </p>
            <div className="rounded-lg bg-white/[0.03] p-2.5 text-xs font-mono text-purple-300 border border-white/5">
              Bot Username: {SERVER_CONFIG.tg_bot}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
            <div className="flex items-center gap-2.5 text-emerald-300 font-semibold text-xs mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Open Learning Policy</span>
            </div>
            <p className="text-xs text-emerald-100/70">
              Learnxpw is completely free. No subscription, credit card, or account registration needed.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 mt-1">Everything you need to know about {SERVER_CONFIG.webName}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-[#101524] p-5">
              <h3 className="text-sm font-bold text-white flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
