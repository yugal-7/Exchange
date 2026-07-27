'use client';

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

  return (
    <div className="mt-4 flex flex-col gap-4">
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
  )
}
