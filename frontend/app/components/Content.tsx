'use client';

import { type Ticker } from "../utils/types";
import { Tile } from "./HomeTile";

export const Content = ({ tickers }: { tickers: Ticker[] }) => {
  const newMarkets = tickers?.sort((a, b) => Number(a.trades) - Number(b.trades)).slice(0, 5);
  const topMarkets = tickers?.sort((a, b) => Number(b.priceChangePercent) - Number(a.priceChangePercent)).slice(0, 5);
  const popularMarkets = tickers?.sort((a, b) => Number(b.trades) - Number(a.trades)).slice(0, 5);

  return (
    <div className="mt-4 flex flex-col gap-4 sm:flex-row">
      <Tile props={{ title: 'New', data: newMarkets }} />
      <Tile props={{ title: 'Top Gainers', data: topMarkets }} />
      <Tile props={{ title: 'Popular', data: popularMarkets }} />
    </div>
  )
}
