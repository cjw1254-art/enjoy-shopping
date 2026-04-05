"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: "target",
    question: "이 쇼핑은 누구를 위한 건가요?",
    emoji: "🛍️",
    options: [
      { label: "나를 위해", value: "나를 위한 구매" },
      { label: "가족을 위해", value: "가족을 위한 구매" },
      { label: "나 + 가족 모두", value: "나와 가족 모두를 위한 구매" },
    ],
  },
  {
    id: "concern",
    question: "요즘 가장 신경 쓰이는 게 뭐예요?",
    emoji: "🪞",
    options: [
      { label: "피부 탄력·주름", value: "피부 탄력과 주름" },
      { label: "피로·에너지", value: "피로 회복과 에너지" },
      { label: "피부 광채·수분", value: "피부 광채와 수분" },
      { label: "장 건강·면역", value: "장 건강과 면역" },
      { label: "갱년기 케어", value: "갱년기 증상 케어" },
      { label: "모발·두피", value: "모발과 두피 건강" },
    ],
  },
  {
    id: "energy",
    question: "요즘 에너지 레벨은 어때요?",
    emoji: "⚡",
    options: [
      { label: "매우 피곤해요", value: "매우 낮음" },
      { label: "조금 피곤해요", value: "낮음" },
      { label: "보통이에요", value: "보통" },
      { label: "활력 있어요", value: "높음" },
    ],
  },
  {
    id: "budget",
    question: "한 달 예산은 어느 정도예요?",
    emoji: "💳",
    options: [
      { label: "2만원 이하", value: "2만원 이하" },
      { label: "2~4만원", value: "2만원~4만원" },
      { label: "4~6만원", value: "4만원~6만원" },
      { label: "6만원 이상", value: "6만원 이상" },
    ],
  },
  {
    id: "style",
    question: "어떤 형태가 편해요?",
    emoji: "✨",
    options: [
      { label: "스틱·파우더", value: "스틱 또는 파우더 타입" },
      { label: "캡슐·알약", value: "캡슐 또는 알약 타입" },
      { label: "음료·드링크", value: "음료 또는 드링크 타입" },
      { label: "상관없어요", value: "제형 무관" },
    ],
  },
];

interface ValuationLayer { label: string; description: string; score: number; }
interface Recommendation {
  name: string; ingredient: string; price: string; match: number; tip: string;
  valuation: { totalScore: number; layers: ValuationLayer[]; aiSummary: string; };
}

function computeWeights(answers: Record<string, string>) {
  const isForSelf   = answers.target?.includes("나를");
  const isForFamily = answers.target?.includes("가족") && !answers.target?.includes("모두");
  const highFatigue = ["매우 낮음", "낮음"].includes(answers.energy || "");
  const fatigueConcern = ["피로 회복과 에너지", "갱년기 증상 케어"].includes(answers.concern || "");

  let w1 = 25, w2 = 30, w3 = 25, w4 = 20;
  if (isForSelf)   { w1 = 30; w4 = 10; }
  if (isForFamily) { w1 = 10; w4 = 40; }
  if (!isForSelf && !isForFamily) { w1 = 20; w4 = 30; }
  if (highFatigue || fatigueConcern) w2 = Math.min(w2 + 10, 40);
  if (["피부 탄력과 주름", "피부 광채와 수분"].includes(answers.concern || "")) w3 = 30;

  const total = w1 + w2 + w3 + w4;
  const n = (w: number) => Math.round((w / total) * 100);
  return { w1: n(w1), w2: n(w2), w3: n(w3), w4: n(w4), isForFamily };
}

// ─── Valuation 차트 컴포넌트 ───
function ValuationChart({ items }: { items: { name: string; totalScore: number; price: string }[] }) {
  const sorted = [...items].sort((a, b) => b.totalScore - a.totalScore);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
      <p className="text-sm font-bold text-stone-700 mb-0.5">Valuation 종합 점수 비교</p>
      <p className="text-xs text-stone-400 mb-4">추천 10개 제품 전체</p>
      <div className="space-y-2.5">
        {sorted.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-300 w-4 text-right flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs text-stone-600 truncate pr-2">
                  {item.name.length > 16 ? item.name.substring(0, 16) + "…" : item.name}
                </span>
                <span className="text-xs font-bold text-stone-700 flex-shrink-0">{item.totalScore}</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${i === 0 ? "bg-green-600" : i < 3 ? "bg-green-500" : i < 6 ? "bg-green-300" : "bg-stone-300"}`}
                  style={{ width: `${item.totalScore}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-stone-400 flex-shrink-0 w-14 text-right">{item.price.replace("~", "")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FALLBACK: Recommendation[] = [
  { name: "아모레퍼시픽 바이탈뷰티 슈퍼콜라겐", ingredient: "저분자 콜라겐 5,000mg", price: "42,000원~", match: 94, tip: "피부 탄력을 가장 빠르게 회복할 수 있어요",
    valuation: { totalScore: 91, aiSummary: "탄력 고민에 임상 검증된 성분으로 가장 효과적인 선택이에요", layers: [
      { label: "감정적 가치", description: "나를 위한 투자를 선택한 당신, 그 자체로 충분해요", score: 93 },
      { label: "시간·에너지", description: "월 42,000원으로 하루 에너지 +25분 예상", score: 89 },
      { label: "건강·웰니스", description: "8주 후 피부 탄력 +15% 개선 (임상 기준)", score: 92 },
      { label: "가족 전체 가치", description: "활력이 늘어나면 가족과의 시간이 더 따뜻해져요", score: 88 },
    ]}},
  { name: "CJ웰케어 이너비 콜라겐 플러스", ingredient: "피쉬 콜라겐 + 히알루론산", price: "38,000원~", match: 89, tip: "탄력과 수분을 동시에 케어해요",
    valuation: { totalScore: 87, aiSummary: "탄력과 수분을 동시에 케어하는 효율적인 선택이에요", layers: [
      { label: "감정적 가치", description: "꾸준히 챙기는 작은 습관이 나를 사랑하는 루틴이 돼요", score: 87 },
      { label: "시간·에너지", description: "월 38,000원으로 하루 에너지 +20분 예상", score: 85 },
      { label: "건강·웰니스", description: "8주 후 피부 탄력 +12%, 수분 +10% 동시 개선", score: 88 },
      { label: "가족 전체 가치", description: "피부 변화로 자신감이 높아져 가족과 더 밝은 모습으로 만날 수 있어요", score: 83 },
    ]}},
  { name: "에스더포뮬러 글루타치온 이너케어", ingredient: "글루타치온 500mg + 비타민C", price: "52,000원~", match: 86, tip: "피부 광채와 항산화가 필요하다면 이 제품이에요",
    valuation: { totalScore: 84, aiSummary: "광채 케어와 항산화를 동시에 잡는 프리미엄 선택이에요", layers: [
      { label: "감정적 가치", description: "광채 있는 피부는 나를 더 당당하게 만들어줘요", score: 86 },
      { label: "시간·에너지", description: "월 52,000원으로 하루 활력 +18분 예상", score: 82 },
      { label: "건강·웰니스", description: "6주 후 피부 광채 개선 +20%, 항산화 효과 우수", score: 87 },
      { label: "가족 전체 가치", description: "활기찬 엄마의 모습이 가족에게도 긍정 에너지를 줘요", score: 80 },
    ]}},
  { name: "뉴트리디데이 NMN 12000", ingredient: "NMN 250mg + 리보스", price: "58,000원~", match: 83, tip: "세포 단위의 에너지 회복을 원한다면",
    valuation: { totalScore: 83, aiSummary: "세포 재생과 에너지 회복에 최적화된 프리미엄 선택이에요", layers: [
      { label: "감정적 가치", description: "세포부터 젊어지는 느낌, 나를 더 오래 가꾸는 투자예요", score: 83 },
      { label: "시간·에너지", description: "월 58,000원으로 하루 에너지 +30분 회복 예상", score: 88 },
      { label: "건강·웰니스", description: "12주 후 피로도 감소 25%, 피부 탄력 +10% 예상", score: 84 },
      { label: "가족 전체 가치", description: "높아진 에너지로 가족과 더 활발하게 소통할 수 있어요", score: 78 },
    ]}},
  { name: "코스맥스 이너뷰티 앰플 젤리", ingredient: "콜라겐 3,000mg + 나이아신아마이드", price: "45,000원~", match: 82, tip: "맛있게 간편하게 챙기고 싶다면",
    valuation: { totalScore: 82, aiSummary: "맛있고 간편하게 챙기면서 탄력과 톤업을 동시에 잡아요", layers: [
      { label: "감정적 가치", description: "간식처럼 즐기는 이너뷰티, 죄책감 없이 맛있게 나를 챙겨요", score: 84 },
      { label: "시간·에너지", description: "월 45,000원으로 하루 +15분 에너지 회복 예상", score: 80 },
      { label: "건강·웰니스", description: "8주 후 피부 톤 개선 +15%, 탄력 +10% 예상", score: 83 },
      { label: "가족 전체 가치", description: "간편한 섭취로 꾸준한 관리가 가능해 가족도 함께 챙길 수 있어요", score: 80 },
    ]}},
  { name: "종근당건강 락토핏 이너뷰티", ingredient: "유산균 50억 + 콜라겐 + 비타민C", price: "28,000원~", match: 80, tip: "장 건강부터 피부까지 한 번에 잡아요",
    valuation: { totalScore: 80, aiSummary: "장·면역·피부 케어의 가성비 최고 선택이에요", layers: [
      { label: "감정적 가치", description: "속부터 건강해지면 마음도 가벼워져요", score: 82 },
      { label: "시간·에너지", description: "월 28,000원으로 소화 피로 감소, 하루 +12분 에너지", score: 78 },
      { label: "건강·웰니스", description: "4주 후 장 건강 지수 +20%, 피부 광채 개선 예상", score: 83 },
      { label: "가족 전체 가치", description: "가족도 함께 챙기기 좋은 합리적인 가격이에요", score: 78 },
    ]}},
  { name: "GNM 자연의품격 히알루론산 앰플", ingredient: "히알루론산 120mg + 비타민C", price: "18,000원~", match: 79, tip: "예산 내에서 수분과 광채를 동시에 챙겨요",
    valuation: { totalScore: 79, aiSummary: "예산 내 최고의 수분·광채 솔루션이에요", layers: [
      { label: "감정적 가치", description: "부담 없는 가격으로 나를 챙기는 습관을 시작해요", score: 80 },
      { label: "시간·에너지", description: "월 18,000원으로 하루 에너지 +10분 예상", score: 75 },
      { label: "건강·웰니스", description: "6주 후 피부 수분 +18% 개선 (임상 기준)", score: 82 },
      { label: "가족 전체 가치", description: "저렴한 가격으로 가족도 함께 챙길 수 있어요", score: 79 },
    ]}},
  { name: "한국야쿠르트 하루야채 이너뷰티", ingredient: "야채 혼합 + 콜라겐 펩타이드", price: "35,000원~", match: 77, tip: "간편하게 야채 영양과 이너뷰티를 함께",
    valuation: { totalScore: 77, aiSummary: "야채 영양과 이너뷰티를 간편하게 챙기는 실용적 선택이에요", layers: [
      { label: "감정적 가치", description: "건강한 음료 한 잔이 하루를 시작하는 나만의 루틴이 돼요", score: 78 },
      { label: "시간·에너지", description: "월 35,000원으로 하루 +12분 에너지 회복 예상", score: 76 },
      { label: "건강·웰니스", description: "8주 후 종합 영양 보충 + 피부 개선 예상", score: 78 },
      { label: "가족 전체 가치", description: "음료 타입이라 가족 모두 부담 없이 마실 수 있어요", score: 75 },
    ]}},
  { name: "바이오셀 마린 피쉬 콜라겐", ingredient: "마린 콜라겐 10,000mg", price: "32,000원~", match: 76, tip: "고함량 콜라겐으로 탄력을 집중 케어해요",
    valuation: { totalScore: 76, aiSummary: "고함량 콜라겐으로 탄력을 집중 케어하는 실용적 선택이에요", layers: [
      { label: "감정적 가치", description: "고함량 성분으로 제대로 나를 케어한다는 뿌듯함이 있어요", score: 77 },
      { label: "시간·에너지", description: "월 32,000원으로 하루 +10분 에너지 회복 예상", score: 74 },
      { label: "건강·웰니스", description: "10주 후 피부 탄력 +13% 개선 (임상 기준)", score: 78 },
      { label: "가족 전체 가치", description: "꾸준한 탄력 개선으로 자신감 있는 모습을 가족에게 보여줄 수 있어요", score: 73 },
    ]}},
  { name: "뉴스킨 피부톤업 이너케어 비타민", ingredient: "멀티비타민 복합체 + 아연", price: "48,000원~", match: 75, tip: "종합 비타민으로 전신 컨디션을 끌어올려요",
    valuation: { totalScore: 75, aiSummary: "전신 컨디션 관리와 피부 톤업을 함께 잡는 선택이에요", layers: [
      { label: "감정적 가치", description: "종합 영양으로 몸 전체를 챙긴다는 안도감이 있어요", score: 75 },
      { label: "시간·에너지", description: "월 48,000원으로 하루 +15분 에너지 회복 예상", score: 77 },
      { label: "건강·웰니스", description: "8주 후 피부 톤 개선 + 전신 컨디션 향상 예상", score: 76 },
      { label: "가족 전체 가치", description: "전신 컨디션 개선으로 가족을 더 활기차게 돌볼 수 있어요", score: 72 },
    ]}},
];

const layerColors = ["text-rose-500", "text-amber-500", "text-emerald-500", "text-violet-500"];
const layerBg = ["bg-rose-50 border-rose-100", "bg-amber-50 border-amber-100", "bg-emerald-50 border-emerald-100", "bg-violet-50 border-violet-100"];
const barColors = ["bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-violet-400"];

export default function BasicModePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(0);

  const shopUrl = (name: string) =>
    `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(name)}`;

  const handleSelect = async (value: string) => {
    const stepId = steps[currentStep].id;
    const newAnswers = { ...answers, [stepId]: value };
    setAnswers(newAnswers);
    if (currentStep < steps.length - 1) { setCurrentStep((s) => s + 1); return; }

    setLoading(true);
    const { w1, w2, w3, w4, isForFamily } = computeWeights(newAnswers);

    try {
      const prompt = `당신은 따뜻하고 공감 능력이 높은 AI 이너뷰티 동반자입니다. 언제나 친한 친구처럼 부드럽고 친근한 말투로 대화하세요.

당신은 한국 이너뷰티 전문가이자 AI Valuation 시스템이기도 합니다.
35~50세 한국 여성을 위해 제품 추천 + 4개 레이어 Valuation 분석을 제공해주세요.

사용자 정보:
- 구매 목적: ${newAnswers.target}
- 주요 고민: ${newAnswers.concern}
- 에너지 레벨: ${newAnswers.energy}
- 월 예산: ${newAnswers.budget}
- 선호 제형: ${newAnswers.style}

동적 Valuation 가중치 (합계 ~100):
- Layer1 감정적 가치: ${w1}% ${isForFamily ? "(가족 구매이므로 최소화)" : "(나를 위한 소비 정당성 강조)"}
- Layer2 시간·에너지 가치: ${w2}% (에너지 ${newAnswers.energy}이므로 조정됨)
- Layer3 건강·웰니스 가치: ${w3}%
- Layer4 가족 전체 가치: ${w4}% ${isForFamily ? "(가족 구매이므로 최우선)" : ""}

위 가중치를 반영해 각 레이어 설명과 score를 작성하고, 총 10개 제품을 추천하세요.

반드시 아래 JSON 형식으로만 응답하세요 (배열 10개):
[
  {
    "name": "제품명 (브랜드 포함)",
    "ingredient": "핵심 성분 1~2가지",
    "price": "월 가격대",
    "match": 92,
    "tip": "한 줄 추천 이유 (35자 이내, 따뜻한 말투)",
    "valuation": {
      "totalScore": 88,
      "layers": [
        { "label": "감정적 가치", "description": "따뜻한 설명", "score": 90 },
        { "label": "시간·에너지", "description": "월 OO원으로 하루 에너지 +XX분 예상", "score": 85 },
        { "label": "건강·웰니스", "description": "X주 후 XX% 개선 (임상 기준)", "score": 88 },
        { "label": "가족 전체 가치", "description": "가족과의 연결 설명", "score": 82 }
      ],
      "aiSummary": "AI 한 줄 요약 (40자 이내)"
    }
  }
]
match는 내림차순, totalScore도 내림차순 경향으로 설정하세요.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 3000 }),
      });
      const data = await response.json();
      const clean = (data.choices?.[0]?.message?.content || "").replace(/```json|```/g, "").trim();
      setResults(JSON.parse(clean));
    } catch {
      setResults(FALLBACK);
    } finally { setLoading(false); }
  };

  const handleBack = () => {
    if (results) { setResults(null); setCurrentStep(steps.length - 1); }
    else if (currentStep > 0) { setCurrentStep((s) => s - 1); }
    else { router.push("/"); }
  };

  const targetLabel = answers.target?.includes("가족") && !answers.target?.includes("모두")
    ? "가족을 위한 쇼핑" : answers.target?.includes("모두") ? "나 + 가족" : "나를 위한 쇼핑";

  return (
    <div className="min-h-screen bg-[#f2f0ec] p-6">
      <div className="relative max-w-2xl mx-auto">
        <button onClick={handleBack} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-sm mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {results ? "다시 설문하기" : "돌아가기"}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-stone-700 flex items-center justify-center text-xl">🌿</div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Basic Mode</p>
            <h1 className="text-2xl font-bold text-stone-800">이너뷰티 추천</h1>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <div className="text-4xl mb-4 animate-bounce">🌿</div>
            <p className="text-stone-500 text-base font-medium">맞춤 제품 10개 + Valuation 분석 중...</p>
            <p className="text-stone-400 text-sm mt-1">잠깐만요, 금방 찾아드릴게요</p>
          </div>
        )}

        {/* Survey */}
        {!loading && !results && (
          <div>
            <div className="mb-8">
              <div className="flex justify-between text-xs text-stone-300 mb-2">
                <span>{currentStep + 1} / {steps.length}</span>
                <span>거의 다 왔어요 🍃</span>
              </div>
              <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-4">
              <div className="text-4xl mb-4">{steps[currentStep].emoji}</div>
              <h2 className="text-xl font-bold text-stone-800 mb-6 leading-snug">{steps[currentStep].question}</h2>
              <div className={`grid gap-3 ${steps[currentStep].id === "target" ? "grid-cols-1" : "grid-cols-2"}`}>
                {steps[currentStep].options.map((opt) => (
                  <button key={opt.value} onClick={() => handleSelect(opt.value)}
                    className="text-left py-3.5 px-4 rounded-xl border-2 border-stone-100 bg-stone-50 hover:border-green-400 hover:bg-green-50 text-stone-700 font-medium text-sm transition-all active:scale-[0.98]">
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {currentStep > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.values(answers).map((val, i) => (
                  <span key={i} className="text-xs bg-white text-green-700 border border-green-200 rounded-full px-3 py-1">✓ {val}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <div>
            {/* Profile summary */}
            <div className="bg-stone-800 rounded-2xl p-5 mb-5 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">내 맞춤 프로필</p>
                <span className="text-xs bg-white/20 rounded-full px-3 py-1 font-medium">{targetLabel}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.values(answers).map((val, i) => (
                  <span key={i} className="text-xs bg-white/10 rounded-full px-3 py-1">{val}</span>
                ))}
              </div>
            </div>

            {/* Valuation Chart */}
            <ValuationChart items={results.map(r => ({ name: r.name, totalScore: r.valuation.totalScore, price: r.price }))} />

            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest text-center mb-4">추천 제품 10개 상세</p>

            <div className="flex flex-col gap-4">
              {results.map((item, i) => (
                <div key={i} className={`bg-white rounded-2xl border-2 overflow-hidden ${i === 0 ? "border-green-500" : "border-stone-200"}`}>
                  {/* Card header */}
                  <div className="p-5">
                    <div className="flex gap-4 mb-3">
                      {/* Product image placeholder */}
                      <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-xl flex-shrink-0">
                        🌿
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {i === 0 && <span className="inline-block text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full mb-1">가장 잘 맞아요</span>}
                            <h3 className="font-bold text-stone-800 text-sm leading-snug">{item.name}</h3>
                            <p className="text-stone-400 text-xs mt-0.5">{item.ingredient}</p>
                          </div>
                          <div className="flex-shrink-0 text-center">
                            <div className={`text-xl font-bold ${i === 0 ? "text-green-600" : "text-stone-400"}`}>{item.match}%</div>
                            <div className="text-xs text-stone-300">매칭</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-stone-500 text-sm">{item.tip}</p>
                      <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg flex-shrink-0 ml-3">{item.price}</span>
                    </div>
                    <div className="mt-3">
                      <a href={shopUrl(item.name)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-400 px-3 py-1.5 rounded-lg transition-colors">
                        네이버 쇼핑에서 보기 →
                      </a>
                    </div>
                  </div>

                  {/* Valuation section */}
                  <div className="border-t border-stone-100">
                    <button onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-stone-50 hover:bg-stone-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-600 uppercase tracking-widest">💎 Valuation</span>
                        <span className={`text-sm font-bold ${i === 0 ? "text-green-600" : "text-stone-500"}`}>{item.valuation.totalScore}점</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-stone-400 transition-transform ${expandedCard === i ? "rotate-180" : ""}`}>
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {expandedCard === i && (
                      <div className="px-5 pb-5 pt-3">
                        {/* 4-layer bar visualization */}
                        <div className="mb-3 bg-stone-50 rounded-xl p-3">
                          {item.valuation.layers.map((layer, li) => (
                            <div key={li} className="flex items-center gap-2 mb-1.5">
                              <span className={`text-xs font-semibold w-20 flex-shrink-0 ${layerColors[li]}`}>{layer.label}</span>
                              <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColors[li]}`} style={{ width: `${layer.score}%` }} />
                              </div>
                              <span className={`text-xs font-bold w-6 text-right ${layerColors[li]}`}>{layer.score}</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 gap-2 mb-3">
                          {item.valuation.layers.map((layer, li) => (
                            <div key={li} className={`rounded-xl border px-4 py-3 ${layerBg[li]}`}>
                              <span className={`text-xs font-bold uppercase tracking-wide ${layerColors[li]}`}>{layer.label}</span>
                              <p className="text-stone-600 text-sm leading-relaxed mt-1">{layer.description}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-stone-800 rounded-xl px-4 py-3">
                          <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">AI 종합</p>
                          <p className="text-white text-sm leading-relaxed">{item.valuation.aiSummary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => router.push("/only-for-me")} className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 font-medium border border-stone-300 hover:border-stone-400 px-4 py-2 rounded-xl transition-colors">
                🌸 더 깊은 개인화 분석은 Only For Me에서
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <p className="text-center text-xs text-stone-400 mt-3 pb-8">AI가 추천한 결과입니다. 구매 전 성분을 확인해보세요 🍃</p>
          </div>
        )}
      </div>
    </div>
  );
}
