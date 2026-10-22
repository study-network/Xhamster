import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  FileText,
  Check,
  Loader2,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface QuestionImage {
  name?: string;
  baseUrl?: string;
  key?: string;
}

interface QuestionOption {
  _id?: string;
  texts?: { en?: string; hi?: string };
  text?: string;
  image?: string;
  imageId?: QuestionImage;
}

interface QuestionItem {
  _id: string;
  type?: string;
  questionNumber?: number;
  positiveMarks?: number | string;
  negativeMarks?: number | string;
  texts?: { en?: string; hi?: string };
  imageIds?: { en?: QuestionImage; hi?: QuestionImage };
  question?: string;
  questionText?: string;
  options?: QuestionOption[];
  difficultyLevel?: number | string;
  sectionName?: string;
  solutions?: string[];
  solutionDescription?: any[];
}

interface TestData {
  _id?: string;
  name?: string;
  title?: string;
  maxDuration?: number;
  totalMarks?: number;
  totalQuestions?: number;
  sections?: Array<{ name: string; questions: QuestionItem[] }>;
  multiGeneralInstructions?: { en?: string; hi?: string };
  multiTestInstructions?: { en?: string; hi?: string };
  syllabus?: { en?: string; hi?: string } | string;
}

export const PracticeTestPage: React.FC = () => {
  const { currentPath, navigate } = useApp();

  const searchParams = new URLSearchParams(window.location.search);
  const batchId = searchParams.get('batchId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const chapterId = searchParams.get('chapterId') || '';
  const batchScheduleId = searchParams.get('batchScheduleId') || searchParams.get('scheduleId') || '';
  const exerciseId = searchParams.get('exerciseId') || '';
  const isQuiz = currentPath.includes('/dpp/') || searchParams.get('testSource') === 'BATCH_QUIZ';
  const testSource = isQuiz ? 'BATCH_QUIZ' : (searchParams.get('testSource') || 'BATCH_TEST_SERIES');

  // Check if we are on instructions page or test player page
  const isInstructions = currentPath.endsWith('/instructions');

  // Extract test/dpp ID from path
  const pathParts = currentPath.split('/').filter(Boolean);
  // e.g. ['practice-v2', 'test', '6ad1e3...', 'instructions'] -> testId is pathParts[2]
  const targetId = isInstructions ? pathParts[pathParts.length - 2] : pathParts[pathParts.length - 1];

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instructionsData, setInstructionsData] = useState<TestData | null>(null);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>('hi');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Load Instructions
  useEffect(() => {
    if (!targetId) return;

    let active = true;
    setLoading(true);
    setError(null);

    async function loadInstructions() {
      try {
        const query = new URLSearchParams({
          testId: targetId,
          batchId: batchId || '',
        });
        const res = await fetch(`/api/test-instructions?${query.toString()}`);
        if (!res.ok) throw new Error('Could not load test instructions');
        const json = await res.json();
        if (active) {
          setInstructionsData(json?.data || null);
        }
      } catch (err: any) {
        console.warn('Instructions load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (isInstructions) {
      loadInstructions();
    }
  }, [targetId, batchId, isInstructions]);

  // Load Test Questions for Live Quiz with fallback retry
  useEffect(() => {
    if (isInstructions || !targetId) return;

    let active = true;
    setLoading(true);
    setError(null);

    async function loadQuestions() {
      try {
        const query = new URLSearchParams();
        if (!isQuiz) {
          query.set('testId', targetId);
          if (batchId) query.set('batchId', batchId);
          query.set('type', 'Start');
          query.set('testSource', 'BATCH_TEST_SERIES');
        } else {
          // BATCH_QUIZ (DPP)
          query.set('testId', targetId);
          query.set('exerciseId', exerciseId || targetId);
          if (batchId) query.set('batchId', batchId);
          if (subjectId) query.set('subjectId', subjectId);
          if (chapterId) query.set('chapterId', chapterId);
          if (batchScheduleId) query.set('batchScheduleId', batchScheduleId);
          query.set('testSource', 'BATCH_QUIZ');
          query.set('type', searchParams.get('type') || 'Start');
        }

        const endpoint = !isQuiz ? '/api/batch-tests' : '/api/dpp-tests';
        let res = await fetch(`${endpoint}?${query.toString()}`);
        let json = await res.json();

        // If dpp-tests fails, cycle through standard fallback states (Resume, start, reattempt, view)
        if ((!res.ok || json?.success === false) && isQuiz) {
          const fallbackStates = ['Resume', 'start', 'reattempt', 'view'];
          for (const st of fallbackStates) {
            query.set('type', st);
            try {
              const tryRes = await fetch(`${endpoint}?${query.toString()}`);
              if (tryRes.ok) {
                const tryJson = await tryRes.json();
                if (tryJson?.success !== false && (tryJson?.data?.sections || tryJson?.sections)) {
                  res = tryRes;
                  json = tryJson;
                  break;
                }
              }
            } catch {}
          }
        }

        if (!active) return;

        if (!res.ok || json?.success === false) {
          const errMsg = json?.error?.message || json?.message || 'This DPP test schedule is not currently active on server.';
          setError(errMsg);
          setLoading(false);
          return;
        }

        const data: TestData = json?.data || json;
        setTestData(data);

        // Flatten all questions across sections
        const allQ: QuestionItem[] = (data?.sections || []).flatMap((sec) =>
          (sec?.questions || []).map((q) => ({
            ...q,
            sectionName: sec.name,
          }))
        );

        setQuestions(allQ);

        // Auto-detect question language availability
        if (allQ.length > 0) {
          const firstHasHi = Boolean(allQ[0].texts?.hi || allQ[0].imageIds?.hi);
          const firstHasEn = Boolean(allQ[0].texts?.en || allQ[0].imageIds?.en);
          if (firstHasHi && !firstHasEn) setSelectedLang('hi');
          else if (!firstHasHi && firstHasEn) setSelectedLang('en');
        }

        // Setup timer duration in seconds
        const durationMin = data?.maxDuration || (json?.data?.test?.maxDuration) || 20;
        const initialSeconds = Number(json?.data?.remainingDuration) || (durationMin * 60);
        setTimeRemaining(initialSeconds);
        setLoading(false);
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Unable to connect to test server.');
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      active = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [targetId, batchId, subjectId, chapterId, batchScheduleId, exerciseId, testSource, isInstructions]);

  // Timer countdown
  useEffect(() => {
    if (isInstructions || loading || submitted || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isInstructions, loading, submitted, timeRemaining]);

  // Format timer as HH:MM:SS or MM:SS
  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQIndex];

  const handleSelectOption = (optIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQIndex]: optIndex,
    }));
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    }
  };

  const handleStartTestFromInstructions = () => {
    const base = currentPath.replace(/\/instructions$/, '');
    navigate(`${base}?${searchParams.toString()}`);
  };

  // 1. INSTRUCTIONS SCREEN (Matching Video 01:03 - 01:09)
  if (isInstructions) {
    return (
      <div className="min-h-screen bg-[#080b18] text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0d1d]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (batchId) navigate(`/study/batches/${batchId}`);
              else navigate('/study/batches');
            }}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </header>

        <div className="container mx-auto max-w-3xl px-4 py-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400 mb-3" />
              <span>Loading instructions...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-6 shadow-xl">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {instructionsData?.name || 'Practice Test'}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
                    {instructionsData?.totalQuestions || 48} Questions
                  </span>
                  <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {instructionsData?.totalMarks || 192} Marks
                  </span>
                  <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                    {instructionsData?.maxDuration || 60} min
                  </span>
                </div>
              </div>

              {/* General Instructions Card */}
              <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-6">
                <h2 className="text-base font-bold text-white mb-3">General Instructions</h2>
                {instructionsData?.multiGeneralInstructions?.en ? (
                  <div
                    className="prose prose-invert text-xs sm:text-sm text-slate-300 leading-relaxed max-w-none [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: instructionsData.multiGeneralInstructions.en }}
                  />
                ) : (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc pl-5">
                    <li>Total duration of Test is {instructionsData?.maxDuration || 60} mins.</li>
                    <li>The Test contains {instructionsData?.totalQuestions || 48} multiple choice questions.</li>
                    <li>There is only one correct response for each question.</li>
                    <li>Each correct answer will give 4 marks while 1 Mark will be deducted for a wrong answer.</li>
                  </ul>
                )}
              </div>

              {/* Test Instructions Card */}
              <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-6">
                <h2 className="text-base font-bold text-white mb-3">Test Instructions</h2>
                {instructionsData?.multiTestInstructions?.en ? (
                  <div
                    className="prose prose-invert text-xs sm:text-sm text-slate-300 leading-relaxed max-w-none [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_img]:max-w-full [&_img]:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: instructionsData.multiTestInstructions.en }}
                  />
                ) : (
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc pl-5">
                    <li>The clock will be set at the server. The countdown timer in the top left corner will display remaining time.</li>
                    <li>To select your answer, click on the button of one of the options.</li>
                    <li>Click on Next to move to the next question or Skip to bypass.</li>
                  </ul>
                )}
              </div>

              {/* Bottom Start Test Action */}
              <div className="flex justify-end pt-2 pb-8">
                <button
                  onClick={handleStartTestFromInstructions}
                  className="rounded-xl bg-[#5a4bda] hover:bg-[#6c5ce7] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.02] cursor-pointer"
                >
                  Start Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. ERROR / UNAVAILABLE STATE (Clear diagnosis & direct resolution)
  if (error && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b18] px-4 py-12 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1222] p-6 text-center shadow-2xl">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-base font-bold text-white">DPP Test Session Status</h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            {error.includes('not in start state')
              ? 'This DPP schedule has ended on Physics Wallah server. You can still access DPP PDFs with full solutions and practice DPP 01, 03, 04, 05, 06, 07!'
              : error}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => {
                if (batchId) navigate(`/study/batches/${batchId}`);
                else navigate('/study/batches');
              }}
              className="rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 transition cursor-pointer"
            >
              Return to Chapter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. RESULT SUMMARY SUBMISSION SCREEN
  if (submitted) {
    const totalAnswered = Object.keys(selectedAnswers).length;
    const totalUnanswered = questions.length - totalAnswered;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b18] px-4 py-12 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1222] p-6 text-center shadow-2xl">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Test Submitted Successfully!</h2>
          <p className="mt-1 text-xs text-slate-400">
            Your responses have been recorded.
          </p>

          <div className="my-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-2xl font-bold text-emerald-400">{totalAnswered}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Attempted</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <span className="text-2xl font-bold text-amber-400">{totalUnanswered}</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Unanswered</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (batchId) navigate(`/study/batches/${batchId}`);
              else navigate('/study/batches');
            }}
            className="w-full rounded-xl bg-purple-600 py-3 text-xs font-bold text-white hover:bg-purple-500 transition cursor-pointer"
          >
            Back to Syllabus
          </button>
        </div>
      </div>
    );
  }

  // 4. LIVE INTERACTIVE QUIZ PLAYER (Matching Video 01:10 - 01:23 and 03:00 - 03:07)
  return (
    <div className="min-h-screen bg-[#080b18] text-white flex flex-col select-none">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0d1d]/95 backdrop-blur-md px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto w-full">
          {/* Back button */}
          <button
            onClick={() => {
              if (batchId) navigate(`/study/batches/${batchId}`);
              else navigate('/study/batches');
            }}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
            title="Exit Test"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Countdown Timer */}
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] border border-white/10 px-3 py-1 font-mono text-xs sm:text-sm font-bold text-purple-300">
            <Clock className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span>{formatTimer(timeRemaining)}</span>
          </div>

          {/* Submit DPP button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="rounded-lg bg-[#5a4bda] hover:bg-[#6c5ce7] px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition cursor-pointer"
          >
            Submit DPP
          </button>
        </div>

        {/* Question Palette Row */}
        <div className="mt-2.5 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {questions.map((_, idx) => {
              const isCurrent = idx === currentQIndex;
              const isAnswered = selectedAnswers[idx] !== undefined;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 transition cursor-pointer ${
                    isCurrent
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 ring-2 ring-purple-400/50'
                      : isAnswered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPaletteOpen(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
            title="Question Grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Question Display Area */}
      <main className="flex-1 container mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 flex flex-col justify-between">
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400 mb-3" />
            <span>Loading question data...</span>
          </div>
        ) : currentQ ? (
          <div className="space-y-6">
            {/* Badges Row + Language Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-2.5 py-1 text-xs font-bold text-white">
                  {currentQIndex + 1}
                </span>
                <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {currentQ.difficultyLevel === 1
                    ? 'EASY'
                    : currentQ.difficultyLevel === 2
                    ? 'MEDIUM'
                    : currentQ.difficultyLevel === 3
                    ? 'HARD'
                    : 'EASY'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  +{currentQ.positiveMarks || 4} / -{currentQ.negativeMarks || 1}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {Boolean((currentQ.texts?.hi || currentQ.imageIds?.hi) && (currentQ.texts?.en || currentQ.imageIds?.en)) && (
                  <div className="flex rounded-lg bg-white/10 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedLang('hi')}
                      className={`px-2 py-0.5 rounded transition ${selectedLang === 'hi' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      HI
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLang('en')}
                      className={`px-2 py-0.5 rounded transition ${selectedLang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                    >
                      EN
                    </button>
                  </div>
                )}
                {currentQ.sectionName && (
                  <span className="text-xs text-slate-400 font-medium">
                    {currentQ.sectionName}
                  </span>
                )}
              </div>
            </div>

            {/* Question Text / Equation / Image */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-6 text-sm text-slate-200 leading-relaxed shadow-xl space-y-4">
              {(() => {
                const imgObj = selectedLang === 'hi'
                  ? (currentQ.imageIds?.hi || currentQ.imageIds?.en)
                  : (currentQ.imageIds?.en || currentQ.imageIds?.hi);
                const qImgUrl = imgObj?.baseUrl && imgObj?.key ? `${imgObj.baseUrl}${imgObj.key}` : '';

                const qHtml = selectedLang === 'hi'
                  ? (currentQ.texts?.hi || currentQ.texts?.en)
                  : (currentQ.texts?.en || currentQ.texts?.hi);

                return (
                  <>
                    {qImgUrl && (
                      <div className="flex justify-center bg-white rounded-xl p-3 border border-white/20">
                        <img
                          src={qImgUrl}
                          alt={`Question ${currentQIndex + 1}`}
                          className="max-h-96 max-w-full object-contain rounded-lg"
                        />
                      </div>
                    )}
                    {qHtml ? (
                      <div
                        className="prose prose-invert max-w-none text-sm text-white [&_p]:mb-2 [&_img]:max-w-full [&_img]:rounded-lg"
                        dangerouslySetInnerHTML={{ __html: qHtml }}
                      />
                    ) : currentQ.questionText || currentQ.question ? (
                      <p className="text-sm font-medium text-white">
                        {currentQ.questionText || currentQ.question}
                      </p>
                    ) : !qImgUrl ? (
                      <p className="text-sm font-medium text-white">Question #{currentQIndex + 1}</p>
                    ) : null}
                  </>
                );
              })()}
            </div>

            {/* Options List with Radio Selectors */}
            <div className="space-y-3">
              {(currentQ.options || []).map((opt, optIdx) => {
                const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                const isSelected = selectedAnswers[currentQIndex] === optIdx;
                const optHtml = opt.texts?.en || opt.texts?.hi || opt.text || '';

                return (
                  <div
                    key={opt._id || optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`flex items-center justify-between rounded-xl border p-3 sm:p-4 transition cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-600/15 shadow-lg shadow-purple-900/20'
                        : 'border-white/10 bg-[#0d1222] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-400">{optIdx + 1}</span>
                      <span className="font-bold text-white text-xs sm:text-sm">{optLetter}</span>
                      {optHtml ? (
                        <div
                          className="prose prose-invert text-xs sm:text-sm text-slate-200 truncate [&_p]:m-0"
                          dangerouslySetInnerHTML={{ __html: optHtml }}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">Option {optLetter}</span>
                      )}
                    </div>

                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-600 text-white'
                          : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Bottom Navigation Buttons: Next & Skip */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <button
            onClick={handleSkip}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 transition cursor-pointer"
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            className="flex-1 rounded-xl bg-purple-600 py-3 text-xs font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-900/30 transition cursor-pointer"
          >
            Next
          </button>
        </div>
      </main>

      {/* Question Grid Modal */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1222] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">Question Palette</h3>
              <button
                onClick={() => setPaletteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1">
              {questions.map((_, idx) => {
                const isCurrent = idx === currentQIndex;
                const isAnswered = selectedAnswers[idx] !== undefined;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQIndex(idx);
                      setPaletteOpen(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                      isCurrent
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                        : isAnswered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPaletteOpen(false)}
              className="mt-5 w-full rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1222] p-5 text-center shadow-2xl">
            <HelpCircle className="mx-auto h-10 w-10 text-purple-400 mb-3" />
            <h3 className="text-sm font-bold text-white">Submit DPP Quiz?</h3>
            <p className="mt-1 text-xs text-slate-400">
              You have answered {Object.keys(selectedAnswers).length} of {questions.length} questions.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setSubmitted(true);
                }}
                className="flex-1 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
