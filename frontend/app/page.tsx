'use client'
import { Content } from "./components/Content"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Ticker } from "./utils/types";
import { getTickers } from "./utils/httpClient";

export default function Home() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const router = useRouter();

  useEffect(() => {
    getTickers().then((m) => setTickers(m));
  }, []);

  return (
    <main className="mx-auto max-w-[1280px]">
      <div className="relative mt-6 h-[320px] w-full overflow-hidden rounded-2xl border border-baseBorderLight bg-landing bg-cover bg-center sm:h-[380px]">
        <div className="absolute inset-0 bg-gradient-to-t from-baseBackgroundL0 via-baseBackgroundL0/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-end gap-4 p-8 sm:p-12">
          <h1 className="max-w-xl text-3xl font-bold leading-tight text-baseTextHighEmphasis sm:text-[40px]">
            Exchange Made Simple: Fast, Secure, and Reliable
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/trade/SOL_USDC')}
              className="rounded-lg bg-greenPrimaryButtonBackground px-5 py-2.5 text-sm font-semibold text-greenPrimaryButtonText transition hover:opacity-90 active:scale-[0.98]"
            >
              Start Trading
            </button>
            <button
              onClick={() => router.push('/markets')}
              className="rounded-lg border border-baseBorderMed bg-baseBackgroundL1/60 px-5 py-2.5 text-sm font-semibold text-baseTextHighEmphasis backdrop-blur transition hover:border-baseBorderFocus hover:bg-baseBackgroundL2"
            >
              View Markets
            </button>
          </div>
        </div>
      </div>
      <Content tickers={tickers} />
    </main>
  )
}
