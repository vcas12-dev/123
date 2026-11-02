import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Timer, ExternalLink, Video, Eye } from 'lucide-react';
import { SimplifiedInquiryData } from '../types.ts';

interface ClassroomPresentationProps {
  data: SimplifiedInquiryData;
  onClose: () => void;
}

export const ClassroomPresentation: React.FC<ClassroomPresentationProps> = ({ data, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Slides:
  // Slide 0: Topic & Opening Hook
  // Slide 1..N: Each keyword's Image & Video
  // Slide N+1: "Now make your question!"
  const totalSlides = data.keywords.length + 2;

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentIndex((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, onClose]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentKeyword = currentIndex > 0 && currentIndex <= data.keywords.length ? data.keywords[currentIndex - 1] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between select-none no-print">
      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-lg">
            {currentIndex === 0 ? '도입' : currentIndex === totalSlides - 1 ? '질문 작성' : `자료 #${currentIndex}`}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-slate-200">
            {data.topic}
          </h2>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <Timer className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-base font-bold text-amber-300">
            {formatTimer(timerSeconds)}
          </span>
          <button
            type="button"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
          >
            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsTimerRunning(false);
              setTimerSeconds(300);
            }}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto">
          {/* SLIDE 0: OPENING */}
          {currentIndex === 0 && (
            <div className="text-center space-y-6">
              <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-sm font-semibold inline-block">
                오늘의 탐구 주제
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-white">
                {data.topic}
              </h1>
              <div className="p-8 rounded-3xl bg-indigo-900/40 border border-indigo-500/30 max-w-3xl mx-auto shadow-2xl">
                <span className="text-sm font-bold text-amber-300 block mb-2">
                  생각을 여는 질문
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-200">
                  "{data.hookQuestion}"
                </p>
              </div>
              <p className="text-slate-400 text-sm">
                이어지는 핵심 단어 사진과 영상을 보고, 떠오르는 질문을 마음속에 담아보세요.
              </p>
            </div>
          )}

          {/* SLIDE 1..N: KEYWORD MATERIAL */}
          {currentKeyword && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-black text-base border border-amber-400/30">
                    핵심 단어: {currentKeyword.keyword}
                  </span>
                  <span className="text-sm text-slate-400 hidden sm:inline">
                    {currentKeyword.meaning}
                  </span>
                </div>
              </div>

              {/* Two Column: Image & Video Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl">
                  <div className="aspect-video bg-black overflow-hidden relative">
                    <img
                      src={currentKeyword.image.imageUrl}
                      alt={currentKeyword.image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      시각 이미지
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-white text-base">
                      {currentKeyword.image.title}
                    </h3>
                    <p className="text-xs text-amber-300 font-medium bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
                      🔍 관찰 팁: {currentKeyword.image.observationTip}
                    </p>
                  </div>
                </div>

                {/* Video Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl space-y-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950 text-red-300 text-xs font-bold border border-red-800/50">
                      <Video className="w-3.5 h-3.5 text-red-400" />
                      영상 자료
                    </div>
                    <h3 className="font-bold text-white text-lg leading-snug">
                      {currentKeyword.video.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      추천 채널: {currentKeyword.video.channel}
                    </p>
                    <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-200">
                      <span className="font-bold text-amber-300 block mb-1">
                        🎬 눈여겨볼 핵심 장면:
                      </span>
                      {currentKeyword.video.highlightTip}
                    </div>
                  </div>

                  <a
                    href={currentKeyword.video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-transform active:scale-95 shadow-lg shadow-red-900/40"
                  >
                    <Video className="w-4 h-4" />
                    <span>유튜브에서 영상 보기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Question Spark */}
              <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-700/50 text-center">
                <span className="text-xs font-bold text-indigo-300 block mb-1">
                  💡 이 자료를 보고 던져볼 수 있는 질문
                </span>
                <p className="text-base sm:text-lg font-bold text-white">
                  "{currentKeyword.questionSpark}"
                </p>
              </div>
            </div>
          )}

          {/* SLIDE LAST: QUESTION TIME */}
          {currentIndex === totalSlides - 1 && (
            <div className="text-center space-y-6">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-bold border border-emerald-400/30 inline-block">
                ✏️ 질문 만들기 시간
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
                방금 본 자료를 바탕으로 질문을 적어보세요!
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="font-bold text-amber-300 text-base mb-1">
                    1. 사실 질문 (무엇이 보이나요?)
                  </h3>
                  <p className="text-xs text-slate-400">
                    사진이나 영상에서 본 구체적인 사실에 대해 질문해보세요.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="font-bold text-indigo-300 text-base mb-1">
                    2. 생각 질문 (왜 그럴까요?)
                  </h3>
                  <p className="text-xs text-slate-400">
                    이런 일이 왜 일어났는지 원인이나 해결책에 대해 질문해보세요.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar Controls */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-slate-800 bg-slate-900/80">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>이전</span>
        </button>

        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === i ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={currentIndex === totalSlides - 1}
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalSlides - 1))}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold ${
            currentIndex === totalSlides - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          <span>다음</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
