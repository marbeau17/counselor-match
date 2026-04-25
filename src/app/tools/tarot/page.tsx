"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type TarotCard = {
  nameJp: string;
  nameEn: string;
  prompt: string;
  grounding: string;
};

const CARDS: TarotCard[] = [
  {
    nameJp: "愚者",
    nameEn: "The Fool",
    prompt: "あなたは今、何から始めようとしていますか？",
    grounding: "始まりは小さくても構いません。最初の一歩を言葉にしてみましょう。",
  },
  {
    nameJp: "魔術師",
    nameEn: "The Magician",
    prompt: "既に手の中にある力は何ですか？",
    grounding: "外に求める前に、今あるものを一つ書き出してみてください。",
  },
  {
    nameJp: "女教皇",
    nameEn: "The High Priestess",
    prompt: "言葉になる前の直感は、何を伝えていますか？",
    grounding: "静かに呼吸を整え、最初に浮かんだ感覚に耳を澄ませてみましょう。",
  },
  {
    nameJp: "女帝",
    nameEn: "The Empress",
    prompt: "あなたが育てたい大切なものは何ですか？",
    grounding: "育てるには時間が必要です。急がずに、今日できる小さな手入れを考えてみてください。",
  },
  {
    nameJp: "皇帝",
    nameEn: "The Emperor",
    prompt: "守りたい秩序と、手放したい支配はありますか？",
    grounding: "自分を支える枠組みと、縛っている枠組みを分けて書き出してみましょう。",
  },
  {
    nameJp: "恋人",
    nameEn: "The Lovers",
    prompt: "その選択は、本当のあなたと一致していますか？",
    grounding: "頭で考えた答えと、心で感じた答えを、別々に書いてみてください。",
  },
  {
    nameJp: "戦車",
    nameEn: "The Chariot",
    prompt: "相反する衝動を、どう和解させますか？",
    grounding: "両方の声に名前をつけてみると、対話が始まりやすくなります。",
  },
  {
    nameJp: "隠者",
    nameEn: "The Hermit",
    prompt: "今、ひとりになる時間が教えてくれることは？",
    grounding: "静けさの中に浮かぶ言葉を、ひとつだけメモしておきましょう。",
  },
  {
    nameJp: "運命の輪",
    nameEn: "Wheel of Fortune",
    prompt: "今の流れに、どう身を任せますか？",
    grounding: "抗う力と委ねる力、どちらも大切です。今日はどちらを選びますか。",
  },
  {
    nameJp: "節制",
    nameEn: "Temperance",
    prompt: "あなたの中で、何と何が統合を求めていますか？",
    grounding: "相反するものを一度紙の両端に置き、その間にある共通点を探してみてください。",
  },
];

function yyyymmdd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function pickCardIndex(question: string, dateKey: string): number {
  const source = question + dateKey;
  let sum = 0;
  for (let i = 0; i < source.length; i += 1) {
    sum += source.charCodeAt(i);
  }
  return sum % CARDS.length;
}

export default function TarotReflectionPage() {
  const [question, setQuestion] = useState("");
  const [drawn, setDrawn] = useState<TarotCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dateKey = useMemo(() => yyyymmdd(new Date()), []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (trimmed.length < 10) {
      setError("問いを10文字以上で記してみてください。");
      setDrawn(null);
      return;
    }
    setError(null);
    const index = pickCardIndex(trimmed, dateKey);
    setDrawn(CARDS[index]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-indigo-900 md:text-4xl">
            タロット1枚引き・内省プロンプト
          </h1>
          <p className="mt-3 text-sm text-indigo-700 md:text-base">
            未来を当てるためではなく、今のあなたに問いを届けるために。
          </p>
          <p className="mt-4 rounded-md bg-indigo-100/60 px-4 py-2 text-xs text-indigo-800 md:text-sm">
            このカードは予言ではなく、内省のきっかけです。
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-indigo-100 bg-white dark:bg-gray-950 p-6 shadow-sm"
        >
          <label htmlFor="question" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
            今、心にある問いを書いてみてください（10文字以上）
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            required
            minLength={10}
            placeholder="例：この関係を続けるかどうか、自分の中で迷っています。"
            className="mt-2 w-full resize-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {error && (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            カードを引く
          </button>
        </form>

        {drawn && (
          <section
            key={drawn.nameEn}
            className="mt-10 animate-[fadeIn_0.6s_ease-out] rounded-xl border border-purple-200 bg-white dark:bg-gray-950 p-8 shadow-md"
            aria-live="polite"
          >
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-purple-500">
                {drawn.nameEn}
              </p>
              <h2 className="mt-1 text-3xl font-bold text-purple-900 md:text-4xl">
                {drawn.nameJp}
              </h2>
            </div>

            <blockquote className="my-8 border-l-4 border-purple-300 bg-purple-50/60 px-5 py-6 text-center text-lg font-medium text-purple-900 md:text-xl">
              {drawn.prompt}
            </blockquote>

            <div className="rounded-md bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
              <span className="font-semibold text-gray-800 dark:text-gray-200">グラウンディングのヒント：</span>
              <span className="ml-1">{drawn.grounding}</span>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              少し時間をとって、このカードと対話してみてください。
            </p>

            <div className="mt-8 text-center">
              <Link
                href="/counselors?methodology=tarot"
                className="inline-block rounded-md border border-purple-600 px-5 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-600 hover:text-white"
              >
                カードについてもっと深く探る
              </Link>
            </div>
          </section>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </main>
  );
}
