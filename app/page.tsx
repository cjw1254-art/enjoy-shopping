"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f2f0ec] flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-base font-bold tracking-[0.3em] text-green-600 uppercase mb-4">
            Inner Bloom!
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-stone-800 mb-3 tracking-tight leading-tight">
            Enjoy ur<br />
            <span className="text-green-600">shopping!</span>
          </h1>
          <p className="text-stone-500 text-sm mt-3">
            🍃Like picking up tea leaves in nature 🌱 
          </p>
        </div>

        {/* Selection Mode */}
        <div className="mb-6">
          <p className="text-center text-base font-bold tracking-[0.2em] text-stone-600 uppercase mb-6">
            Selection Mode
          </p>

          <div className="grid grid-cols-3 gap-3">

            {/* Quick Buy */}
            <button
              onClick={() => router.push("/quick-buy")}
              className="bg-white border-2 border-stone-200 hover:border-green-500 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md active:scale-[0.97]"
            >
              <div className="text-4xl mb-3">⚡</div>
              <p className="font-bold text-stone-800 text-sm mb-2">Quick Buy</p>
              <p className="text-stone-400 text-xs leading-relaxed">신속하게 쇼핑을 도와드릴게요!</p>
            </button>

            {/* Basic Mode */}
            <button
              onClick={() => router.push("/basic")}
              className="bg-white border-2 border-stone-200 hover:border-green-500 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md active:scale-[0.97]"
            >
              <div className="text-4xl mb-3">🌿</div>
              <p className="font-bold text-stone-800 text-sm mb-2">Basic Mode</p>
              <p className="text-stone-400 text-xs leading-relaxed">나와 가족을 위한 간편 추천</p>
            </button>

            {/* Only For Me */}
            <button
              onClick={() => router.push("/only-for-me")}
              className="bg-white border-2 border-stone-200 hover:border-green-500 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md active:scale-[0.97]"
            >
              <div className="text-4xl mb-3">🌸</div>
              <p className="font-bold text-stone-800 text-sm mb-2">Only For ME ♪</p>
              <p className="text-stone-400 text-xs leading-relaxed">
                We&apos;ll be right here,<br />only for you 🍃
              </p>
            </button>

          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Like picking up tea leaves in nature 🌱
        </p>
      </div>
    </div>
  );
}
