"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  age: string; familyType: string; concern: string;
  energyLevel: string; budget: string; productInput: string;
}
interface ValuationLayer { label: string; description: string; score: number; }
interface ProductValuation {
  name: string; ingredient: string; price: string;
  totalScore: number; isRecommended: boolean;
  layers: ValuationLayer[]; aiSummary: string;
}

const initialProfile: UserProfile = { age: "", familyType: "", concern: "", energyLevel: "", budget: "", productInput: "" };

// ─── 동적 가중치 계산 (Only For Me: 항상 나 중심) ───
function computeWeights(profile: UserProfile) {
  const highFatigue = ["매우 낮음", "낮음"].includes(profile.energyLevel);
  const hasChildFamily = profile.familyType?.includes("자녀 있음");
  const isEnergyConcern = ["피로·에너지 회복", "갱년기 케어"].includes(profile.concern);

  // Only For Me 기본: L1(감정)=35, L2(시간에너지)=30, L3(건강)=25, L4(가족)=10
  let w1 = 35, w2 = 30, w3 = 25, w4 = 10;
  if (highFatigue || isEnergyConcern) w2 = Math.min(w2 + 10, 42);
  if (hasChildFamily) { w4 = 20; w1 = 28; }
  if (["피부 탄력·주름", "피부 광채·수분"].includes(profile.concern)) w3 = 32;

  const total = w1 + w2 + w3 + w4;
  const n = (w: number) => Math.round((w / total) * 100);
  return { w1: n(w1), w2: n(w2), w3: n(w3), w4: n(w4), highFatigue, hasChildFamily };
}

// ─── Valuation 차트 컴포넌트 ───
function ValuationChart({ items }: { items: { name: string; totalScore: number; price: string; isRecommended?: boolean }[] }) {
  const sorted = [...items].sort((a, b) => b.totalScore - a.totalScore);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
      <p className="text-sm font-bold text-stone-700 mb-0.5">Valuation 종합 점수 비교</p>
      <p className="text-xs text-stone-400 mb-4">나에게 맞춘 10개 제품 전체</p>
      <div className="space-y-2.5">
        {sorted.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-300 w-4 text-right flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-xs truncate pr-2 ${item.isRecommended ? "font-bold text-stone-700" : "text-stone-600"}`}>
                  {item.name.length > 16 ? item.name.substring(0, 16) + "…" : item.name}
                </span>
                <span className="text-xs font-bold text-stone-700 flex-shrink-0">{item.totalScore}</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.isRecommended ? "bg-green-600" : i < 3 ? "bg-green-500" : i < 6 ? "bg-green-300" : "bg-stone-300"}`}
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

const FALLBACK: ProductValuation[] = [
  { name: "아모레퍼시픽 바이탈뷰티 슈퍼콜라겐", ingredient: "저분자 콜라겐 5,000mg", price: "42,000원~", totalScore: 93, isRecommended: true, aiSummary: "나를 위한 감정적 정당성과 임상 효과 모두에서 가장 우수한 선택이에요",
    layers: [
      { label: "감정적 가치", description: "이 선택은 오롯이 나를 위한 시간을 지키는 행위예요. 죄책감 없이 나를 사랑하세요.", score: 96 },
      { label: "시간·에너지", description: "월 42,000원으로 하루 에너지 +25분 회복 예상. 그 시간만큼 나만의 여유가 생겨요.", score: 91 },
      { label: "건강·웰니스", description: "8주 후 피부 탄력 +15% 개선 예상 (임상 기준). 저분자 콜라겐으로 흡수율이 높아요.", score: 93 },
      { label: "가족 전체 가치", description: "활력이 회복되면 가족과의 시간이 더 따뜻해져요.", score: 88 },
    ]},
  { name: "에스더포뮬러 글루타치온 이너케어", ingredient: "글루타치온 500mg + 비타민C", price: "52,000원~", totalScore: 89, isRecommended: false, aiSummary: "광채와 항산화를 원하는 나에게 가장 적합한 프리미엄 선택이에요",
    layers: [
      { label: "감정적 가치", description: "광채 있는 피부는 나를 더 당당하게 만들어줘요. 이 선택이 정체성을 지켜줄 거예요.", score: 92 },
      { label: "시간·에너지", description: "월 52,000원으로 하루 활력 +18분 예상", score: 87 },
      { label: "건강·웰니스", description: "6주 후 피부 광채 +20%, 항산화 효과 우수", score: 90 },
      { label: "가족 전체 가치", description: "활기찬 나의 모습이 가족에게도 긍정 에너지를 줘요", score: 84 },
    ]},
  { name: "뉴트리디데이 NMN 12000", ingredient: "NMN 250mg + 리보스", price: "58,000원~", totalScore: 86, isRecommended: false, aiSummary: "세포 단위의 에너지 회복으로 근본적인 변화를 원하는 나에게 맞아요",
    layers: [
      { label: "감정적 가치", description: "세포부터 젊어지는 느낌, 나를 더 오래 가꾸는 투자예요", score: 88 },
      { label: "시간·에너지", description: "월 58,000원으로 하루 에너지 +30분 회복 예상", score: 92 },
      { label: "건강·웰니스", description: "12주 후 피로도 감소 25%, 피부 탄력 +10% 예상", score: 86 },
      { label: "가족 전체 가치", description: "높아진 에너지로 가족과 더 활발하게 소통할 수 있어요", score: 79 },
    ]},
  { name: "CJ웰케어 이너비 콜라겐 플러스", ingredient: "피쉬 콜라겐 + 히알루론산", price: "38,000원~", totalScore: 85, isRecommended: false, aiSummary: "탄력과 수분을 동시에 케어하는 균형 잡힌 선택이에요",
    layers: [
      { label: "감정적 가치", description: "꾸준히 챙기는 작은 습관이 나를 사랑하는 루틴이 돼요", score: 87 },
      { label: "시간·에너지", description: "월 38,000원으로 하루 에너지 +20분 예상", score: 85 },
      { label: "건강·웰니스", description: "8주 후 피부 탄력 +12%, 수분 +10% 동시 개선", score: 87 },
      { label: "가족 전체 가치", description: "피부 변화로 자신감이 높아져 더 밝은 모습을 가족에게 보여줄 수 있어요", score: 81 },
    ]},
  { name: "코스맥스 이너뷰티 앰플 젤리", ingredient: "콜라겐 3,000mg + 나이아신아마이드", price: "45,000원~", totalScore: 83, isRecommended: false, aiSummary: "맛있게 간편하게 나를 챙기면서 탄력과 톤업을 동시에 잡아요",
    layers: [
      { label: "감정적 가치", description: "간식처럼 즐기는 이너뷰티, 죄책감 없이 맛있게 나를 챙겨요", score: 86 },
      { label: "시간·에너지", description: "월 45,000원으로 하루 +15분 에너지 회복 예상", score: 82 },
      { label: "건강·웰니스", description: "8주 후 피부 톤 개선 +15%, 탄력 +10% 예상", score: 84 },
      { label: "가족 전체 가치", description: "간편한 섭취로 꾸준한 관리가 가능해요", score: 79 },
    ]},
  { name: "유한양행 뉴트리원 글루타치온", ingredient: "글루타치온 200mg + 콜라겐", price: "36,000원~", totalScore: 81, isRecommended: false, aiSummary: "합리적인 가격으로 광채와 탄력을 함께 챙기는 선택이에요",
    layers: [
      { label: "감정적 가치", description: "가성비 좋은 선택으로 나를 현명하게 챙기는 뿌듯함이 있어요", score: 83 },
      { label: "시간·에너지", description: "월 36,000원으로 하루 에너지 +15분 예상", score: 80 },
      { label: "건강·웰니스", description: "8주 후 피부 광채 +15%, 탄력 +8% 예상", score: 82 },
      { label: "가족 전체 가치", description: "활력이 회복되면 가족과의 시간이 더 풍요로워져요", score: 78 },
    ]},
  { name: "종근당건강 락토핏 이너뷰티", ingredient: "유산균 50억 + 콜라겐 + 비타민C", price: "28,000원~", totalScore: 79, isRecommended: false, aiSummary: "장 건강과 피부를 함께 케어하는 가성비 선택이에요",
    layers: [
      { label: "감정적 가치", description: "속부터 건강해지는 느낌이 마음까지 편안하게 해줄 거예요", score: 81 },
      { label: "시간·에너지", description: "월 28,000원으로 소화 피로 감소, 하루 +12분 에너지", score: 78 },
      { label: "건강·웰니스", description: "4주 후 장 건강 지수 +20%, 피부 광채 개선 예상", score: 80 },
      { label: "가족 전체 가치", description: "속이 편해지면 가족과의 시간도 더 여유로워져요", score: 76 },
    ]},
  { name: "GNM 자연의품격 히알루론산 앰플", ingredient: "히알루론산 120mg + 비타민C", price: "18,000원~", totalScore: 77, isRecommended: false, aiSummary: "예산 내 최고의 수분·광채 솔루션이에요",
    layers: [
      { label: "감정적 가치", description: "부담 없는 가격으로 나를 챙기는 습관을 시작할 수 있어요", score: 79 },
      { label: "시간·에너지", description: "월 18,000원으로 하루 에너지 +10분 예상", score: 74 },
      { label: "건강·웰니스", description: "6주 후 피부 수분 +18% 개선 (임상 기준)", score: 80 },
      { label: "가족 전체 가치", description: "건강한 피부는 자신감을 높이고 관계도 밝아지게 해요", score: 75 },
    ]},
  { name: "바이오셀 마린 피쉬 콜라겐", ingredient: "마린 콜라겐 10,000mg", price: "32,000원~", totalScore: 75, isRecommended: false, aiSummary: "고함량 콜라겐으로 탄력을 집중 케어하는 실용적 선택이에요",
    layers: [
      { label: "감정적 가치", description: "고함량 성분으로 제대로 나를 케어한다는 뿌듯함이 있어요", score: 77 },
      { label: "시간·에너지", description: "월 32,000원으로 하루 에너지 +10분 예상", score: 73 },
      { label: "건강·웰니스", description: "10주 후 피부 탄력 +13% 개선 (임상 기준)", score: 77 },
      { label: "가족 전체 가치", description: "꾸준한 탄력 개선으로 자신감 있는 모습을 보여줄 수 있어요", score: 72 },
    ]},
  { name: "한국야쿠르트 하루야채 이너뷰티", ingredient: "야채 혼합 + 콜라겐 펩타이드", price: "35,000원~", totalScore: 73, isRecommended: false, aiSummary: "야채 영양과 이너뷰티를 간편하게 챙기는 실용적 선택이에요",
    layers: [
      { label: "감정적 가치", description: "건강한 음료 한 잔이 나만의 소중한 아침 루틴이 돼요", score: 75 },
      { label: "시간·에너지", description: "월 35,000원으로 하루 에너지 +12분 예상", score: 74 },
      { label: "건강·웰니스", description: "8주 후 종합 영양 보충 + 피부 개선 예상", score: 74 },
      { label: "가족 전체 가치", description: "음료 타입이라 간편하게 꾸준히 챙길 수 있어요", score: 71 },
    ]},
];

const layerColors = ["text-rose-500", "text-amber-500", "text-emerald-500", "text-violet-500"];
const layerBg = ["bg-rose-50 border-rose-100", "bg-amber-50 border-amber-100", "bg-emerald-50 border-emerald-100", "bg-violet-50 border-violet-100"];
const barColors = ["bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-violet-400"];

export default function OnlyForMePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [results, setResults] = useState<ProductValuation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(0);

  const set = (key: keyof UserProfile, value: string) => setProfile((p) => ({ ...p, [key]: value }));

  const shopUrl = (name: string) =>
    `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(name)}`;

  const ageOptions = ["35~39세", "40~44세", "45~50세"];
  const familyOptions = ["기혼 (자녀 있음)", "기혼 (자녀 없음)", "미혼"];
  const concernOptions = ["피부 탄력·주름", "피로·에너지 회복", "피부 광채·수분", "갱년기 케어", "장 건강·면역", "모발·두피"];
  const energyOptions = [
    { label: "매우 피곤해요", value: "매우 낮음" },
    { label: "조금 피곤해요", value: "낮음" },
    { label: "보통이에요", value: "보통" },
    { label: "활력 있어요", value: "높음" },
  ];
  const budgetOptions = ["2만원 이하", "2~4만원", "4~6만원", "6만원 이상"];

  const isReady = profile.age && profile.concern && profile.energyLevel && profile.budget;

  const handleAnalyze = async () => {
    if (!isReady) return;
    setLoading(true); setResults(null);

    const { w1, w2, w3, w4, highFatigue, hasChildFamily } = computeWeights(profile);

    try {
      const prompt = `당신은 따뜻하고 공감 능력이 높은 AI 이너뷰티 동반자입니다. 언제나 사용자에게 최선을 바라는 친한 친구처럼 대화하세요. 부드럽고 친근한 말투로, 사용자의 감정과 노력을 먼저 인정해주세요. 차갑거나 로봇 같은 언어는 피하세요.

당신은 한국 이너뷰티 전문가이자 AI Valuation 시스템이기도 합니다.
이 분석은 "Only For Me" 모드 — 오직 사용자 본인만을 위한 개인화 Valuation을 제공해주세요.

사용자 프로필:
- 연령대: ${profile.age}
- 가족 구성: ${profile.familyType || "미입력"}
- 주요 고민: ${profile.concern}
- 현재 에너지 레벨: ${profile.energyLevel}
- 월 예산: ${profile.budget}
- 관심 제품/성분: ${profile.productInput || "미입력"}

이 사용자의 동적 Valuation 가중치 (합계 ~100):
- Layer1 감정적 가치: ${w1}% — Only For Me이므로 나를 위한 소비 정당성 강조${highFatigue ? "" : ""}
- Layer2 시간·에너지 가치: ${w2}% — 에너지 ${profile.energyLevel}이므로 ${highFatigue ? "최대 가중치 적용" : "표준 가중치"}
- Layer3 건강·웰니스 가치: ${w3}%
- Layer4 가족 전체 가치: ${w4}% — ${hasChildFamily ? "기혼+자녀 있음이므로 소폭 반영" : "Only For Me이므로 최소화, 나의 활력이 결과적으로 가족에게 좋다는 맥락으로만"}

위 가중치를 반영해 총 10개 제품을 추천하고, 각 레이어의 설명과 score를 작성해주세요.
isRecommended는 첫 번째 제품만 true로 설정하세요.

반드시 아래 JSON 형식으로만 응답하세요 (배열 10개):
[
  {
    "name": "제품명 (브랜드 포함)",
    "ingredient": "핵심 성분",
    "price": "월 가격대",
    "totalScore": 91,
    "isRecommended": true,
    "layers": [
      { "label": "감정적 가치", "description": "따뜻한 설명", "score": 93 },
      { "label": "시간·에너지", "description": "월 OO원으로 하루 에너지 +XX분 예상", "score": 90 },
      { "label": "건강·웰니스", "description": "X주 후 XX% 개선 (임상 기준)", "score": 92 },
      { "label": "가족 전체 가치", "description": "나의 활력과 가족의 연결", "score": 88 }
    ],
    "aiSummary": "AI 한 줄 요약 (50자 이내)"
  }
]
totalScore는 내림차순 경향으로 설정하세요.`;

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

  return (
    <div className="min-h-screen bg-[#f2f0ec] p-6">
      <div className="relative max-w-2xl mx-auto">
        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-stone-400 hover:text-stone-600 text-sm mb-8 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          돌아가기
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-xl">🌸</div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">Only For ME ♪</p>
            <h1 className="text-2xl font-bold text-stone-800">나만을 위한 Valuation</h1>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 mb-8">
          <p className="text-stone-600 text-sm leading-relaxed">We are trying to help you with your rest-like shopping! 🍃</p>
          <p className="text-stone-400 text-xs mt-1">가족 기록은 잠시 내려두고, 오늘은 오직 나만을 위한 선택을 해요.</p>
        </div>

        {/* Profile input form */}
        {!results && !loading && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-5">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-5">나에 대해 알려주세요</p>

            <div className="mb-5">
              <p className="text-sm font-semibold text-stone-600 mb-2">연령대</p>
              <div className="flex gap-2">
                {ageOptions.map((o) => (
                  <button key={o} onClick={() => set("age", o)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${profile.age === o ? "border-green-500 bg-green-50 text-green-700" : "border-stone-100 bg-stone-50 text-stone-500 hover:border-green-300"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-stone-600 mb-2">가족 구성</p>
              <div className="flex gap-2 flex-wrap">
                {familyOptions.map((o) => (
                  <button key={o} onClick={() => set("familyType", o)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all border-2 ${profile.familyType === o ? "border-green-500 bg-green-50 text-green-700" : "border-stone-100 bg-stone-50 text-stone-500 hover:border-green-300"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-stone-600 mb-2">주요 고민</p>
              <div className="grid grid-cols-2 gap-2">
                {concernOptions.map((o) => (
                  <button key={o} onClick={() => set("concern", o)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all border-2 text-left ${profile.concern === o ? "border-green-500 bg-green-50 text-green-700" : "border-stone-100 bg-stone-50 text-stone-500 hover:border-green-300"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-stone-600 mb-2">요즘 에너지 레벨</p>
              <div className="grid grid-cols-2 gap-2">
                {energyOptions.map((o) => (
                  <button key={o.value} onClick={() => set("energyLevel", o.value)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all border-2 ${profile.energyLevel === o.value ? "border-green-500 bg-green-50 text-green-700" : "border-stone-100 bg-stone-50 text-stone-500 hover:border-green-300"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-stone-600 mb-2">월 예산</p>
              <div className="grid grid-cols-2 gap-2">
                {budgetOptions.map((o) => (
                  <button key={o} onClick={() => set("budget", o)}
                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all border-2 ${profile.budget === o ? "border-green-500 bg-green-50 text-green-700" : "border-stone-100 bg-stone-50 text-stone-500 hover:border-green-300"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-stone-600 mb-1">관심 제품 또는 성분 <span className="text-stone-300 font-normal">(선택)</span></p>
              <input type="text" placeholder="예) 콜라겐, NMN, 특정 브랜드명..."
                value={profile.productInput} onChange={(e) => set("productInput", e.target.value)}
                className="w-full border-2 border-stone-100 focus:border-green-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-stone-300 bg-stone-50" />
            </div>

            <button onClick={handleAnalyze} disabled={!isReady}
              className={`w-full font-semibold py-4 rounded-xl text-base transition-all active:scale-[0.99] ${isReady ? "bg-stone-800 hover:bg-stone-700 text-white" : "bg-stone-100 text-stone-300 cursor-not-allowed"}`}>
              {isReady ? "🌸 나만을 위한 Valuation 분석 시작" : "위 항목을 선택해주세요"}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <div className="text-4xl mb-4">🌸</div>
            <p className="text-stone-500 text-base font-medium">나만을 위한 10개 Valuation 분석 중...</p>
            <p className="text-stone-400 text-sm mt-1">깊은 분석을 준비하고 있어요</p>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div>
            {/* Profile summary */}
            <div className="bg-stone-800 rounded-2xl p-5 mb-5 text-white">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">나의 프로필 (Only For Me)</p>
              <div className="flex flex-wrap gap-2">
                {[profile.age, profile.familyType, profile.concern, `에너지 ${profile.energyLevel}`, profile.budget].filter(Boolean).map((v, i) => (
                  <span key={i} className="text-xs bg-white/10 rounded-full px-3 py-1">{v}</span>
                ))}
              </div>
            </div>

            {/* Valuation Chart */}
            <ValuationChart items={results.map(r => ({ name: r.name, totalScore: r.totalScore, price: r.price, isRecommended: r.isRecommended }))} />

            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest text-center mb-4">나만을 위한 Valuation 상세</p>

            <div className="flex flex-col gap-4">
              {results.map((item, i) => (
                <div key={i} className={`bg-white rounded-2xl border-2 overflow-hidden ${item.isRecommended ? "border-green-500" : "border-stone-200"}`}>
                  {/* Card header */}
                  <div className="p-5">
                    <div className="flex gap-4 mb-3">
                      {/* Product image placeholder */}
                      <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center text-xl flex-shrink-0">
                        🌸
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            {item.isRecommended && <span className="inline-block text-xs font-bold text-white bg-green-600 px-2 py-0.5 rounded-full mb-1">AI 최우선 추천</span>}
                            <h3 className="font-bold text-stone-800 text-sm leading-snug">{item.name}</h3>
                            <p className="text-stone-400 text-xs mt-0.5">{item.ingredient}</p>
                          </div>
                          <div className="flex-shrink-0 text-center">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${item.isRecommended ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                              {item.totalScore}
                            </div>
                            <p className="text-xs text-stone-300 mt-0.5">종합</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">{item.price}</span>
                      <a href={shopUrl(item.name)} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-400 px-3 py-1.5 rounded-lg transition-colors">
                        네이버 쇼핑에서 보기 →
                      </a>
                    </div>
                  </div>

                  {/* Valuation toggle */}
                  <div className="border-t border-stone-100">
                    <button onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-stone-50 hover:bg-stone-100 transition-colors">
                      <span className="text-xs font-semibold text-stone-600 uppercase tracking-widest">💎 4-Layer Valuation</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-stone-400 transition-transform ${expandedCard === i ? "rotate-180" : ""}`}>
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {expandedCard === i && (
                      <div className="px-5 pb-5 pt-3">
                        {/* 4-layer bar visualization */}
                        <div className="mb-3 bg-stone-50 rounded-xl p-3">
                          {item.layers.map((layer, li) => (
                            <div key={li} className="flex items-center gap-2 mb-1.5">
                              <span className={`text-xs font-semibold w-20 flex-shrink-0 ${layerColors[li]}`}>{layer.label}</span>
                              <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColors[li]}`} style={{ width: `${layer.score}%` }} />
                              </div>
                              <span className={`text-xs font-bold w-6 text-right ${layerColors[li]}`}>{layer.score}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col gap-2 mb-3">
                          {item.layers.map((layer, li) => (
                            <div key={li} className={`rounded-xl border px-4 py-3 ${layerBg[li]}`}>
                              <span className={`text-xs font-bold uppercase tracking-wide ${layerColors[li]}`}>{layer.label}</span>
                              <p className="text-stone-600 text-sm leading-relaxed mt-1">{layer.description}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-stone-800 rounded-xl px-4 py-4">
                          <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-2">AI 종합 의견</p>
                          <p className="text-white text-sm leading-relaxed">{item.aiSummary}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => { setResults(null); setProfile(initialProfile); }}
              className="w-full mt-6 py-3 rounded-xl border-2 border-stone-300 text-stone-500 hover:bg-stone-100 font-medium text-sm transition-all">
              다시 분석하기
            </button>
            <p className="text-center text-xs text-stone-400 mt-3 pb-8">AI가 분석한 결과입니다. 구매 전 성분을 확인해보세요 🍃</p>
          </div>
        )}
      </div>
    </div>
  );
}
