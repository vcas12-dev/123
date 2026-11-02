export interface KeywordMaterial {
  id: string;
  keyword: string;
  englishKeyword: string;
  meaning: string;
  image: {
    title: string;
    imageUrl: string;
    observationTip: string;
    unsplashUrl?: string;
  };
  video: {
    title: string;
    channel: string;
    youtubeUrl: string;
    searchQuery: string;
    highlightTip: string;
  };
  questionSpark: string;
}

export interface SimplifiedInquiryData {
  id: string;
  topic: string;
  hookQuestion: string;
  keywords: KeywordMaterial[];
  timestamp: number;
}
