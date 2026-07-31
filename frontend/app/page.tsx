'use client'
import { Content } from "./components/Content"
import { Hero } from "./components/home/Hero"
import { TickerTape } from "./components/home/TickerTape"
import { BuiltWith } from "./components/home/BuiltWith"
import { PullToRefresh } from "./components/core/PullToRefresh"

import { useCallback, useEffect, useState } from "react";
import { type Ticker } from "./utils/types";
import { getTickers } from "./utils/httpClient";

export default function Home() {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickers = useCallback(async () => {
    const m = await getTickers();
    setTickers(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTickers();
  }, [loadTickers]);

  return (
    <PullToRefresh onRefresh={loadTickers}>
      <main>
        <Hero tickers={tickers} loading={loading} />
        <TickerTape tickers={tickers} />
        <div className="mx-auto max-w-[1280px]">
          <Content tickers={tickers} />
          <BuiltWith />
        </div>
      </main>
    </PullToRefresh>
  )
}
