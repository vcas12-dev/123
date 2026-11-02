import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Curated high-res fallback stock images by domain
const thematicFallbacks: Record<string, string> = {
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  space: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  environment: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1200&q=80',
  ocean: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  ai: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  robot: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  history: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80',
  animal: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=1200&q=80',
  vehicle: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  society: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
  korea: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
  food: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80',
};

// Fetch real educational image from Wikipedia/Wikimedia with timeout
async function fetchWikiImage(query: string): Promise<string | null> {
  if (!query || !query.trim()) return null;
  const clean = query.trim().replace(/['"“”]/g, '');

  const endpoints = [
    `https://ko.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(clean)}&gsrlimit=1&prop=pageimages&pithumbsize=1000&format=json`,
    `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(clean)}&gsrlimit=1&prop=pageimages&pithumbsize=1000&format=json`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.query?.pages) {
          const firstPage: any = Object.values(data.query.pages)[0];
          if (firstPage?.thumbnail?.source) {
            return firstPage.thumbnail.source;
          }
        }
      }
    } catch {
      // Continue to next endpoint or fallback
    }
  }
  return null;
}

function getFallbackImage(keyword: string, englishKeyword: string): string {
  const combined = `${keyword} ${englishKeyword}`.toLowerCase();
  if (combined.includes('세종') || combined.includes('훈민정음') || combined.includes('조선') || combined.includes('역사') || combined.includes('한글')) {
    return thematicFallbacks.korea;
  }
  if (combined.includes('곰') || combined.includes('동물') || combined.includes('북극') || combined.includes('펭귄') || combined.includes('사자')) {
    return thematicFallbacks.animal;
  }
  if (combined.includes('플라스틱') || combined.includes('환경') || combined.includes('쓰레기') || combined.includes('오염')) {
    return thematicFallbacks.environment;
  }
  if (combined.includes('바다') || combined.includes('해양') || combined.includes('물고기') || combined.includes('생태')) {
    return thematicFallbacks.ocean;
  }
  if (combined.includes('ai') || combined.includes('인공지능') || combined.includes('컴퓨터') || combined.includes('데이터')) {
    return thematicFallbacks.ai;
  }
  if (combined.includes('로봇') || combined.includes('기계') || combined.includes('기술')) {
    return thematicFallbacks.robot;
  }
  if (combined.includes('차') || combined.includes('자율주행') || combined.includes('교통') || combined.includes('비행기')) {
    return thematicFallbacks.vehicle;
  }
  if (combined.includes('우주') || combined.includes('위성') || combined.includes('행성') || combined.includes('별')) {
    return thematicFallbacks.space;
  }
  if (combined.includes('사람') || combined.includes('시민') || combined.includes('어린이') || combined.includes('사회') || combined.includes('윤리')) {
    return thematicFallbacks.society;
  }
  return thematicFallbacks.science;
}

// API: Curate simplified keyword materials
app.post('/api/curate-materials', async (req, res) => {
  try {
    const { topic = '' } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: '수업 주제를 입력해주세요.' });
    }

    const cleanTopic = topic.trim();

    const promptContext = `
선생님이 입력한 수업 주제: "${cleanTopic}"

[목표]
수업 주제("${cleanTopic}")에서 학생들의 호기심과 질문을 가장 강하게 자극할 수 있는 서로 다른 2~3개의 '핵심 단어'를 추출하세요.
그리고 각 핵심 단어마다 학생들이 보고 질문을 떠올릴 수 있는 시각 이미지 설명과 추천 유튜브 영상 정보를 간결하게 작성하세요.
반드시 "${cleanTopic}"의 구체적인 내용에 맞는 고유한 내용을 생성해야 합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "hookQuestion": "${cleanTopic}과 관련해 교실 칠판에 크게 적어둘 한 줄 마중물 질문",
  "keywords": [
    {
      "keyword": "핵심 단어 1 (예: ${cleanTopic}의 핵심 개념)",
      "englishKeyword": "영문 검색어 (위키피디아/이미지 검색용 영문)",
      "meaning": "이 단어가 뜻하는 핵심 개념 (1문장)",
      "imageTitle": "사진 속 장면 설명",
      "observationTip": "학생들이 사진을 볼 때 눈여겨보아야 할 관찰 포인트 (1문장)",
      "videoTitle": "추천 영상 제목",
      "channel": "추천 채널 또는 영상 유형",
      "youtubeSearch": "유튜브 검색어",
      "highlightTip": "영상 속 눈여겨볼 추천 장면 (1문장)",
      "questionSpark": "학생들이 이 자료를 보고 던져볼 만한 질문 예시 (1문장)"
    },
    {
      "keyword": "핵심 단어 2",
      "englishKeyword": "영문 검색어",
      "meaning": "개념 설명",
      "imageTitle": "사진 속 장면 설명",
      "observationTip": "관찰 포인트",
      "videoTitle": "추천 영상 제목",
      "channel": "채널",
      "youtubeSearch": "유튜브 검색어",
      "highlightTip": "추천 장면",
      "questionSpark": "질문 예시"
    }
  ]
}
`;

    let generatedText = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        // Use gemini-3.1-flash-lite for instant, high-speed, accurate generation
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: promptContext,
          config: {
            responseMimeType: 'application/json',
          },
        });
        generatedText = response.text || '';
      } catch (geminiError: any) {
        console.error('Gemini generateContent error:', geminiError?.message || geminiError);
      }
    }

    let parsed: any = null;
    if (generatedText) {
      try {
        const cleaned = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
      }
    }

    // Dynamic smart fallback if API fails
    if (!parsed || !parsed.keywords || parsed.keywords.length === 0) {
      parsed = {
        hookQuestion: `"${cleanTopic}"에 대해 우리는 무엇을 알고 있고, 어떤 점이 가장 궁금한가요?`,
        keywords: [
          {
            keyword: cleanTopic,
            englishKeyword: cleanTopic,
            meaning: `${cleanTopic}의 핵심 현상과 실태`,
            imageTitle: `${cleanTopic}의 실태를 보여주는 실제 장면`,
            observationTip: '사진 속 사물이나 인물의 상태를 자세히 들여다보세요.',
            videoTitle: `[핵심 클립] 3분으로 보는 ${cleanTopic}`,
            channel: 'EBS / 지식 채널',
            youtubeSearch: `${cleanTopic} 다큐 탐구`,
            highlightTip: '현상의 원인과 결과가 명확히 드러나는 핵심 하이라이트 구간',
            questionSpark: `왜 이런 일이 일어나고 있으며, 앞으로 어떻게 될까?`,
          },
          {
            keyword: `${cleanTopic}의 영향`,
            englishKeyword: `${cleanTopic} impact`,
            meaning: `${cleanTopic}이 우리 사회와 미래에 미치는 변화`,
            imageTitle: `${cleanTopic}과 관련된 변화를 보여주는 대비되는 장면`,
            observationTip: '과거와 현재, 또는 전과 후의 차이점에 주목해보세요.',
            videoTitle: `${cleanTopic}의 숨겨진 원인과 사람들의 반응`,
            channel: '이슈 탐구 리포트',
            youtubeSearch: `${cleanTopic} 원인 문제점`,
            highlightTip: '사람들이 미처 몰랐던 충격적인 사실이 밝혀지는 구간',
            questionSpark: `이 문제의 가장 큰 원인은 무엇이며, 우리는 무엇을 바꿀 수 있을까?`,
          },
        ],
      };
    }

    // Enhance each keyword with dynamic real image & YouTube URL
    const enrichedKeywords = await Promise.all(
      parsed.keywords.map(async (kw: any, index: number) => {
        // Priority 1: Real Wikipedia image for the Korean keyword
        let imageUrl = await fetchWikiImage(kw.keyword);

        // Priority 2: Real Wikipedia image for the English keyword or topic
        if (!imageUrl && kw.englishKeyword) {
          imageUrl = await fetchWikiImage(kw.englishKeyword);
        }

        // Priority 3: Real Wikipedia image for the topic itself
        if (!imageUrl) {
          imageUrl = await fetchWikiImage(cleanTopic);
        }

        // Priority 4: Thematic high-res stock fallback
        if (!imageUrl) {
          imageUrl = getFallbackImage(kw.keyword, kw.englishKeyword || '');
        }

        const searchQuery = kw.youtubeSearch || `${cleanTopic} ${kw.keyword}`;
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
        const unsplashUrl = `https://unsplash.com/s/photos/${encodeURIComponent(kw.englishKeyword || kw.keyword)}`;

        return {
          id: `kw-${Date.now()}-${index}`,
          keyword: kw.keyword,
          englishKeyword: kw.englishKeyword || '',
          meaning: kw.meaning || '',
          image: {
            title: kw.imageTitle || kw.image?.title || `${kw.keyword} 시각 자료`,
            imageUrl,
            observationTip: kw.observationTip || kw.image?.observationTip || '사진을 찬찬히 살펴보고 눈에 띄는 부분을 찾아보세요.',
            unsplashUrl,
          },
          video: {
            title: kw.videoTitle || kw.video?.title || `[영상] ${kw.keyword} 탐구 클립`,
            channel: kw.channel || kw.video?.channel || '추천 탐구 채널',
            youtubeUrl,
            searchQuery,
            highlightTip: kw.highlightTip || kw.video?.highlightTip || '핵심 장면 추천',
          },
          questionSpark: kw.questionSpark || `${kw.keyword}에 대해 무엇이 가장 궁금한가요?`,
        };
      })
    );

    return res.json({
      id: `inquiry-${Date.now()}`,
      topic: cleanTopic,
      hookQuestion: parsed.hookQuestion || `${cleanTopic}을 바라보며 떠오르는 질문은?`,
      keywords: enrichedKeywords,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Server error in /api/curate-materials:', error);
    return res.status(500).json({
      error: '자료 큐레이션 중 오류가 발생했습니다.',
      details: error?.message,
    });
  }
});

// Setup dev server with Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
