"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  name: string;
  mainIngredient: string;
  price: string;
  score: number;
  badge: string;
  valuation: {
    summary: string;
    energyGain: string;
    skinEffect: string;
  };
}

const FALLBACK: Product[] = [
  {
    name: "아모레퍼시픽 바이탈뷰티 슈퍼콜라겐",
    mainIngredient: "저분자 피쉬 콜라겐 5,000mg",
    price: "42,000원~",
    score: 91,
    badge: "AI 추천",
    valuation: { summary: "월 42,000원으로 피부 탄력 +15%, 하루 에너지 +25분 예상", energyGain: "하루 +25분 에너지", skinEffect: "8주 후 탄력 +15%" },
  },
  {
    name: "CJ웰케어 이너비 콜라겐 플러스",
    mainIngredient: "콜라겐 + 히알루론산",
    price: "38,000원~",
    score: 86,
    badge: "최고 가성비",
    valuation: { summary: "월 38,000원으로 탄력 +14%, 하루 에너지 +22분 케어", energyGain: "하루 +22분 에너지", skinEffect: "8주 후 탄력 +14%" },
  },
  {
    name: "GNM 히알루론산 + 비타민C",
    mainIngredient: "히알루론산 120mg + 비타민C",
    price: "18,000원~",
    score: 82,
    badge: "흡수율 최고",
    valuation: { summary: "월 18,000원으로 피부 수분 +18%, 광채 개선 예상", energyGain: "하루 +12분 에너지", skinEffect: "6주 후 수분 +18%" },
  },
];

const badgeColor: Record<string, string> = {
  "AI 추천": "bg-amber-100 text-amber-700",
  "최고 가성비": "bg-green-100 text-green-700",
  "흡수율 최고": "bg-sky-100 text-sky-700",
  "임상 검증": "bg-violet-100 text-violet-700",
};

export default function QuickBuyPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const timeLimits = [
    { label: "1분", value: 1 },
    { label: "3분", value: 3 },
    { label: "5분+", value: 5 },
  ];

  const handleSubmit = async () => {
    if (!input.trim()) { setError("제품명이나 성분을 입력해주세요!"); return; }
    setError(""); setLoading(true); setResults(null);
    try {
      const prompt = `당신은 따뜻하고 공감 능력이 높은 AI 이너뷰티 동반자입니다. 친한 친구처럼 부드럽고 친근한 말투로 대화하세요.

당신은 한국 이너뷰티 전문가이자 AI 가치 분석 시스템이기도 합니다.
35~50세 한국 기혼 여성 소비자를 위해 상위 3개 제품 추천과 Valuation(가치 환산) 요약을 제공해주세요.
사용자 입력: "${input}"
쇼핑 가능 시간: ${timeLimit ? `${timeLimit}분` : "미정"}

Valuation은 단순 성분 설명이 아니라, 월 가격을 시간·에너지·피부 효과로 환산한 한 문장입니다.
예: "월 38,000원으로 예상 피부 탄력 +14%, 하루 에너지 회복 +22분"

score는 종합 Valuation 점수(0~100)이며, 점수 높은 순으로 3개만 추천하세요.

반드시 아래 JSON 형식으로만 응답하세요:
[
  {
    "name": "제품명 (브랜드 포함)",
    "mainIngredient": "주요 성분 1~2가지",
    "price": "월 가격대 (예: 38,000원~)",
    "score": 88,
    "badge": "AI 추천 or 최고 가성비 or 흡수율 최고 or 임상 검증",
    "valuation": {
      "summary": "월 OO원으로 [효과1] + [효과2] 예상 (40자 이내)",
      "energyGain": "하루 +XX분 에너지",
      "skinEffect": "X주 후 탄력/수분 +XX%"
    }
  }
]`;
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 1000 }),
      });
      const data = await response.json();
      const clean = (data.choices?.[0]?.message?.content || "").replace(/```json|```/g, "").trim();
      setResults(JSON.parse(clean));
    } catch {
      setResults(FALLBACK);
    } finally { setLoading(false); }
  };

  const shopUrl = (name: string) =>
    `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(name)}`;

  return (
    <div className="min-h-screen bg-[#f2f0ec] p-6">
      <div className="relative max-w-2xl mx-auto">
        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-sm mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          돌아가기
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-xl">⚡</div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Quick Buy</p>
              <h1 className="text-2xl font-bold text-stone-800">빠른 구매 결정</h1>
            </div>
          </div>
          <p className="text-stone-500 text-sm mt-3 leading-relaxed">
            제품명이나 원하는 성분을 입력하면<br />Valuation 점수 상위 3개 제품을 즉시 보여드려요.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
          <div className="mb-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">지금 쇼핑 가능한 시간</p>
            <div className="flex gap-2">
              {timeLimits.map((t) => (
                <button key={t.value} onClick={() => setTimeLimit(t.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${timeLimit === t.value ? "border-green-500 bg-green-50 text-green-700" : "border-stone-100 bg-stone-50 text-stone-500 hover:border-green-200"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">찾는 제품 또는 성분</p>
            <input type="text" placeholder="예) 콜라겐, 히알루론산, 피로회복에 좋은 거..." value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full border-2 border-stone-100 focus:border-green-400 rounded-xl px-4 py-3.5 text-base outline-none transition-colors placeholder:text-stone-300 bg-stone-50" />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-60 text-white font-semibold py-4 rounded-xl text-base transition-all active:scale-[0.99]">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                분석 중...
              </span>
            ) : "⚡ 지금 바로 추천받기"}
          </button>
        </div>

        {results && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest text-center">Valuation 상위 3개 추천</p>
            {results.map((product, i) => (
              <div key={i} className={`bg-white rounded-2xl border-2 overflow-hidden ${i === 0 ? "border-green-400" : "border-stone-200"}`}>
                <div className="p-5">
                  {/* Image + Info row */}
                  <div className="flex gap-4 mb-3">
                    {/* Product image placeholder */}
                    <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🌿
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {i === 0 && <span className="text-xs font-bold text-white bg-stone-800 px-2 py-0.5 rounded-full">1순위</span>}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor[product.badge] || "bg-stone-100 text-stone-600"}`}>{product.badge}</span>
                      </div>
                      <h3 className="font-bold text-stone-800 text-sm leading-snug">{product.name}</h3>
                      <p className="text-stone-400 text-xs mt-0.5">{product.mainIngredient}</p>
                    </div>
                    <div className="flex-shrink-0 text-center">
                      <div className={`text-2xl font-bold ${i === 0 ? "text-green-600" : "text-stone-400"}`}>{product.score}</div>
                      <div className="text-xs text-stone-300">점</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">{product.price}</span>
                    <a href={shopUrl(product.name)} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold text-stone-600 hover:text-stone-800 border border-stone-200 hover:border-stone-400 px-3 py-1.5 rounded-lg transition-colors">
                      네이버 쇼핑에서 보기 →
                    </a>
                  </div>
                </div>

                {/* Valuation strip */}
                <div className="bg-stone-50 border-t border-stone-100 px-5 py-3">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1.5">💡 Valuation</p>
                  <p className="text-stone-600 text-sm leading-relaxed mb-2">{product.valuation.summary}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-white text-stone-600 border border-stone-200 rounded-full px-2.5 py-1 font-medium">⚡ {product.valuation.energyGain}</span>
                    <span className="text-xs bg-white text-stone-600 border border-stone-200 rounded-full px-2.5 py-1 font-medium">✨ {product.valuation.skinEffect}</span>
                  </div>
                </div>
              </div>
            ))}
            <p className="text-center text-xs text-stone-300 mt-2 pb-8">AI가 추천한 결과입니다. 구매 전 성분을 확인해보세요 🍃</p>
          </div>
        )}
      </div>
    </div>
  );
}
