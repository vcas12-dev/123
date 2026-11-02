import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  Video,
  Eye,
  Maximize2,
  ExternalLink,
  Printer,
  MonitorPlay,
  RefreshCw,
  Search,
  ArrowRight,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { SimplifiedInquiryData, KeywordMaterial } from './types.ts';
import { ClassroomPresentation } from './components/ClassroomPresentation.tsx';
import { SimpleWorksheetModal } from './components/SimpleWorksheetModal.tsx';
import { ImageModal } from './components/ImageModal.tsx';

const QUICK_TOPICS = [
  '미세플라스틱과 바다 생태계',
  '인공지능의 예술 창작과 저작권',
  '자율주행차의 사고 딜레마',
  '북극곰과 녹아내리는 빙하',
  '세종대왕의 훈민정음 창제',
];

export default function App() {
  const [topicInput, setTopicInput] = useState('미세플라스틱과 바다 생태계');
  const [data, setData] = useState<SimplifiedInquiryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isWorksheetOpen, setIsWorksheetOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<KeywordMaterial['image'] | null>(null);

  const fetchMaterials = async (topicToSearch: string) => {
    if (!topicToSearch.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/curate-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicToSearch.trim() }),
      });

      if (!response.ok) {
        throw new Error('자료를 불러오는 데 실패했습니다.');
      }

      const result: SimplifiedInquiryData = await response.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial demo on mount
  useEffect(() => {
    fetchMaterials('미세플라스틱과 바다 생태계');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMaterials(topicInput);
  };

  const handleSelectQuickTopic = (topic: string) => {
    setTopicInput(topic);
    fetchMaterials(topic);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <HelpCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  질문 퐁퐁!
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  핵심 자료실
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                주제 입력 ➔ 핵심 단어 추출 ➔ 이미지 &amp; 영상으로 질문 유도
              </p>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWorksheetOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>활동지 인쇄</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPresentationOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 transition-all active:scale-95"
              >
                <MonitorPlay className="w-4 h-4" />
                <span>빔프로젝터 모드</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Simple & Focused Search Box */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 no-print space-y-4">
          <div className="max-w-2xl">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              어떤 주제로 질문 수업을 하시나요?
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              수업 주제를 입력하시면 <strong>핵심 단어를 추출</strong>하여 학생들이 직관적으로 보고 질문을 떠올릴 수 있는 <strong>이미지와 영상</strong>만 깔끔하게 찾아드립니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="수업 주제 입력 (예: 미세플라스틱, 기후 변화, 자율주행차 딜레마)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm sm:text-base text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !topicInput.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>단어 &amp; 자료 추출 중...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>핵심 자료 찾기</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Click Topic Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">추천 수업 주제:</span>
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleSelectQuickTopic(topic)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-slate-600 font-medium transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">
              주제에서 핵심 단어를 추출하고 시각 자료와 영상을 연결하고 있습니다...
            </h3>
            <p className="text-xs text-slate-500">
              자료가 복잡하지 않도록 직관적인 1장의 사진과 1개의 영상으로 요약합니다.
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm">
            {errorMessage}
          </div>
        )}

        {/* Simplified Materials View */}
        {data && !isLoading && (
          <div className="space-y-6">
            {/* Topic Banner with Hook Question */}
            <section className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
              <div className="space-y-3 relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold tracking-wide">
                    수업 탐구 주제
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPresentationOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-bold text-xs hover:bg-amber-300 transition-colors flex items-center gap-1"
                    >
                      <MonitorPlay className="w-3.5 h-3.5" />
                      <span>교실 빔프로젝터 띄우기</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {data.topic}
                </h2>

                {/* Hook Question */}
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-amber-200 text-sm sm:text-base font-bold flex items-start gap-2.5">
                  <Lightbulb className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <span>마중물 질문: "{data.hookQuestion}"</span>
                </div>
              </div>
            </section>

            {/* Extracted Core Keywords Materials */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>추출된 핵심 단어 &amp; 시각·영상 자료</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                      {data.keywords.length}개 단어
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    학생들에게 이 사진과 영상을 보여주며 질문을 떠올려보게 하세요.
                  </p>
                </div>
              </div>

              {/* Cards Grid: Each Keyword has 1 Image and 1 Video side by side */}
              <div className="space-y-6">
                {data.keywords.map((kw, index) => (
                  <div
                    key={kw.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden p-5 sm:p-6 space-y-4 hover:border-indigo-300 transition-all"
                  >
                    {/* Keyword Title Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900">
                            핵심 단어: <span className="text-indigo-600">{kw.keyword}</span>
                          </h4>
                          <p className="text-xs text-slate-500">{kw.meaning}</p>
                        </div>
                      </div>
                    </div>

                    {/* Image & Video Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* 1. IMAGE */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
                        <div>
                          {/* Image Thumbnail */}
                          <div
                            className="aspect-video bg-black relative group cursor-pointer overflow-hidden"
                            onClick={() => setZoomedImage(kw.image)}
                          >
                            <img
                              src={kw.image.imageUrl}
                              alt={kw.image.title}
                              onError={(e) => {
                                // Fallback to unsplash high-res nature/science if URL fails
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold text-white flex items-center gap-1">
                              <Eye className="w-3 h-3 text-amber-400" />
                              시각 이미지
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                              <Maximize2 className="w-4 h-4" />
                              <span>사진 크게 보기</span>
                            </div>
                          </div>

                          {/* Image Observation Info */}
                          <div className="p-4 space-y-2">
                            <h5 className="font-bold text-sm text-slate-900">
                              {kw.image.title}
                            </h5>
                            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
                              <span className="font-bold block mb-0.5">🔍 관찰 포인트:</span>
                              <p className="leading-relaxed">{kw.image.observationTip}</p>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 pb-4">
                          <button
                            type="button"
                            onClick={() => setZoomedImage(kw.image)}
                            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1 transition-colors"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>전체 화면으로 사진 보기</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. VIDEO */}
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[11px] font-bold flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              유튜브 영상
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {kw.video.channel}
                            </span>
                          </div>

                          <h5 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                            {kw.video.title}
                          </h5>

                          <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 text-xs text-red-950 space-y-1">
                            <span className="font-bold text-red-800 block">
                              ⏱️ 눈여겨볼 추천 장면:
                            </span>
                            <p className="leading-relaxed">{kw.video.highlightTip}</p>
                          </div>
                        </div>

                        <a
                          href={kw.video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
                        >
                          <Video className="w-4 h-4" />
                          <span>유튜브에서 영상 보기</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Question Spark */}
                    <div className="pt-2">
                      <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-950">
                        <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-indigo-900 block mb-0.5">
                            💡 학생들이 던질 수 있는 질문 예시:
                          </strong>
                          <p className="font-semibold text-indigo-800">
                            "{kw.questionSpark}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Simple Student Question Prompt Guide */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  학생들이 자료를 보고 질문을 적게 하는 방법
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">
                    1. 사실 질문
                  </span>
                  <p className="text-slate-600">
                    "사진 속에서 가장 먼저 눈에 들어온 것은 무엇인가요?"
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">
                    2. 원인 질문
                  </span>
                  <p className="text-slate-600">
                    "왜 저런 일이 발생했을지 이유를 물어보세요."
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">
                    3. 가치 질문
                  </span>
                  <p className="text-slate-600">
                    "만약 저 상황이 계속된다면 우리는 어떻게 해야 할까요?"
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  인쇄 버튼을 누르면 이 자료와 질문 작성란이 포함된 1페이지 활동지가 준비됩니다.
                </p>
                <button
                  type="button"
                  onClick={() => setIsWorksheetOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>1페이지 질문 활동지 출력하기</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-white border-t border-slate-200 text-center text-xs text-slate-400 no-print">
        질문 퐁퐁! 수업 탐구 자료실 — 핵심 단어로 만나는 이미지 &amp; 영상 큐레이터
      </footer>

      {/* Modals */}
      {isPresentationOpen && data && (
        <ClassroomPresentation
          data={data}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}

      {isWorksheetOpen && data && (
        <SimpleWorksheetModal
          data={data}
          onClose={() => setIsWorksheetOpen(false)}
        />
      )}

      <ImageModal
        image={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
    </div>
  );
}
