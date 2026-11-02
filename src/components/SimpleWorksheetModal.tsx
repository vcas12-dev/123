import React, { useState } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { SimplifiedInquiryData } from '../types.ts';

interface SimpleWorksheetModalProps {
  data: SimplifiedInquiryData;
  onClose: () => void;
}

export const SimpleWorksheetModal: React.FC<SimpleWorksheetModalProps> = ({ data, onClose }) => {
  const [gradeClass, setGradeClass] = useState('');
  const [studentName, setStudentName] = useState('');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                1페이지 질문 탐구 활동지 인쇄
              </h3>
              <p className="text-xs text-slate-500">
                A4 1장에 딱 맞게 출력됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>활동지 인쇄 (PDF 저장)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Worksheet Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white print-container">
          <div className="border-2 border-slate-900 p-6 sm:p-8 rounded-lg space-y-6 text-slate-900 font-sans">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>[질문이 있는 수업 탐구 활동지]</span>
                <span>자료를 보고 질문 만들기</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-center tracking-tight my-2">
                {data.topic}
              </h1>
              <p className="text-center text-sm font-bold text-indigo-900">
                "{data.hookQuestion}"
              </p>

              {/* Student Info */}
              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-1 border-b border-slate-300 pb-1">
                  <span className="font-bold text-slate-600">학년 반:</span>
                  <input
                    type="text"
                    value={gradeClass}
                    onChange={(e) => setGradeClass(e.target.value)}
                    placeholder="  학년   반 (모둠:   )"
                    className="w-full bg-transparent outline-none font-medium"
                  />
                </div>
                <div className="flex items-center gap-1 border-b border-slate-300 pb-1">
                  <span className="font-bold text-slate-600">이름:</span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="              "
                    className="w-full bg-transparent outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Stimulus Keywords Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold bg-slate-100 px-3 py-1 rounded border-l-4 border-slate-800 uppercase">
                [자료 확인] 수업에서 관찰한 핵심 단어와 이미지·영상
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {data.keywords.map((kw, i) => (
                  <div key={i} className="border border-slate-300 rounded p-2.5 space-y-1">
                    <span className="font-bold text-slate-900 block">
                      #{i + 1} {kw.keyword}
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {kw.image.title}
                    </p>
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1 rounded">
                      팁: {kw.image.observationTip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions to Write */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold bg-slate-100 px-3 py-1 rounded border-l-4 border-slate-800 uppercase">
                [질문 만들기] 자료를 보며 머릿속에 떠오른 질문을 적어보세요
              </h3>

              {/* Q1 */}
              <div className="border border-slate-300 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Q1. [관찰 질문] 사진이나 영상에서 가장 신기하거나 눈에 띈 것은 무엇인가요?</span>
                </div>
                <div className="h-12 border-b border-dashed border-slate-300 flex items-end pb-1 text-xs text-slate-400">
                  내가 만든 질문:
                </div>
              </div>

              {/* Q2 */}
              <div className="border border-slate-300 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Q2. [원인·생각 질문] 왜 이런 일이 생겼을까요? 원인을 파헤치는 질문을 적어보세요.</span>
                </div>
                <div className="h-12 border-b border-dashed border-slate-300 flex items-end pb-1 text-xs text-slate-400">
                  내가 만든 질문:
                </div>
              </div>

              {/* Q3 */}
              <div className="border border-slate-300 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Q3. [해결·가치 질문] 이 문제를 해결하려면 또는 앞으로 우리는 어떻게 해야 할까요?</span>
                </div>
                <div className="h-12 border-b border-dashed border-slate-300 flex items-end pb-1 text-xs text-slate-400">
                  내가 만든 질문:
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-400">
              <span>질문은 정답이 없습니다. 호기심을 담아 자유롭게 질문해보세요!</span>
              <span>선생님 확인: (        )</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
