import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-green-800 mb-6 tracking-tight">
          Enjoy ur shopping!
        </h1>
        <p className="text-2xl text-green-700 mb-4">
          Like picking up tea leaves in nature
        </p>
        <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto">
          35~50 여성분들을 위한<br />AI 이너뷰티 쇼핑 도우미
        </p>

        <Link
          href="/valuation"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-12 py-5 rounded-3xl text-2xl font-medium shadow-lg transition-all active:scale-95"
        >
          지금 시작하기
        </Link>

        <p className="mt-10 text-sm text-gray-500">
          자연에서 차를 따듯한 마음으로 도와드릴게요 🍃
        </p>
      </div>
    </div>
  );
}