import React from 'react';
import { X, ExternalLink, Eye } from 'lucide-react';

interface ImageModalProps {
  image: {
    title: string;
    imageUrl: string;
    observationTip: string;
    unsplashUrl?: string;
  } | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 no-print"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="aspect-video bg-black flex items-center justify-center overflow-hidden">
          <img
            src={image.imageUrl}
            alt={image.title}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-6 space-y-3 text-white">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded bg-amber-400/20 text-amber-300 text-xs font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              자료 관찰 모드
            </span>
            {image.unsplashUrl && (
              <a
                href={image.unsplashUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <span>고화질 원본</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <h3 className="text-xl font-bold">{image.title}</h3>
          <p className="text-sm text-amber-200 bg-amber-950/50 p-3.5 rounded-xl border border-amber-800/40">
            🔍 <strong>관찰 포인트:</strong> {image.observationTip}
          </p>
        </div>
      </div>
    </div>
  );
};
