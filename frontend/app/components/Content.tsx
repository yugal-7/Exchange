'use client';

import { useState } from "react";
import { type Ticker } from "../utils/types";
import { Tile } from "./HomeTile";
import { useFavorites } from "../utils/favorites";

export const Content = ({ tickers }: { tickers: Ticker[] }) => {
  const favorites = useFavorites();
  const loading = !tickers?.length;
  const watchlist = tickers?.filter((t) => favorites.has(t.symbol));
  const newMarkets = tickers?.sort((a, b) => Number(a.trades) - Number(b.trades)).slice(0, 5);
  const topMarkets = tickers?.sort((a, b) => Number(b.priceChangePercent) - Number(a.priceChangePercent)).slice(0, 5);
  const popularMarkets = tickers?.sort((a, b) => Number(b.trades) - Number(a.trades)).slice(0, 5);

  const tabs = [
    ...(favorites.size > 0 ? [{ key: 'watchlist', label: '★ Watchlist', data: watchlist ?? [], emptyLabel: "No favorites match right now." }] : []),
    { key: 'new', label: 'New', data: newMarkets ?? [], emptyLabel: undefined as string | undefined },
    { key: 'top', label: 'Top Gainers', data: topMarkets ?? [], emptyLabel: undefined as string | undefined },
    { key: 'popular', label: 'Popular', data: popularMarkets ?? [], emptyLabel: undefined as string | undefined },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const active = tabs.find((t) => t.key === activeTab) ?? tabs[0];

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Mobile: segmented tab control, one list visible at a time — avoids
          stacking three full-height lists a user has to scroll through. */}
      <div className="sm:hidden">
        <div className="no-scrollbar mb-3 flex gap-1 overflow-x-auto rounded-lg bg-baseBackgroundL1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`min-h-[40px] flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition active:scale-95 ${
                active.key === tab.key
                  ? "bg-baseBackgroundL3 text-baseTextHighEmphasis"
                  : "text-baseTextMedEmphasis"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Tile props={{ title: active.label, data: active.data, loading, emptyLabel: active.emptyLabel, hideHeader: true }} />
      </div>

      {/* Tablet/desktop: side-by-side, as before */}
      <div className="hidden sm:flex sm:flex-col sm:gap-4">
        {favorites.size > 0 && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <Tile props={{ title: '★ Watchlist', data: watchlist ?? [], loading, emptyLabel: "No favorites match right now." }} />
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Tile props={{ title: 'New', data: newMarkets, loading }} />
          <Tile props={{ title: 'Top Gainers', data: topMarkets, loading }} />
          <Tile props={{ title: 'Popular', data: popularMarkets, loading }} />
        </div>
      </div>
    </div>
  )
}
