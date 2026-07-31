"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { Ticker } from "../utils/types";
import { getTickers } from "../utils/httpClient";
import { useRouter } from "next/navigation";
import { CoinIcon } from "./core/CoinIcon";
import { useFlash } from "../utils/useFlash";
import { useAnimatedNumber } from "../utils/useAnimatedNumber";
import { toggleFavorite, useFavorites } from "../utils/favorites";
import { PullToRefresh } from "./core/PullToRefresh";

const getMarketName = (name: string) => {
  const index = name.indexOf('_USDC');
  return name.substring(0, index);
}

export const Markets = () => {
  const [tickers, setTickers] = useState<Ticker[]>();
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const favorites = useFavorites();

  const loadTickers = useCallback(async () => {
    const m = await getTickers();
    setTickers(m.sort((a, b) => Number(b.lastPrice) - Number(a.lastPrice)));
  }, []);

  useEffect(() => {
    loadTickers();
  }, [loadTickers]);

  const filtered = useMemo(() => {
    if (!tickers) return tickers;
    const q = query.trim().toLowerCase();
    return tickers.filter((t) => {
      if (favoritesOnly && !favorites.has(t.symbol)) return false;
      if (!q) return true;
      return t.symbol.toLowerCase().includes(q);
    });
  }, [tickers, query, favoritesOnly, favorites]);

  const emptyMessage = tickers && filtered?.length === 0
    ? `No markets match "${query}".`
    : null;

  return (
    <PullToRefresh onRefresh={loadTickers}>
    <div className="flex w-full max-w-[1280px] flex-1 flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-baseTextHighEmphasis">Markets</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-baseTextMedEmphasis" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search markets..."
              className="h-10 w-full rounded-lg border border-baseBorderLight bg-baseBackgroundL1 py-1.5 pl-9 pr-3 text-base text-baseTextHighEmphasis placeholder-baseTextMedEmphasis outline-none transition focus:border-accentBlue sm:h-9 sm:w-56 sm:text-sm"
            />
          </div>
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            title="Show favorites only"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition active:scale-95 sm:h-9 sm:w-9 ${
              favoritesOnly
                ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                : "border-baseBorderLight text-baseTextMedEmphasis hover:border-baseBorderFocus hover:text-baseTextHighEmphasis"
            }`}
          >
            <Star size={16} fill={favoritesOnly ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Desktop / tablet: full table */}
      <div className="relative hidden w-full rounded-xl border border-baseBorderLight bg-baseBackgroundL1 md:block">
        <div className="flex w-full flex-col overflow-x-auto px-5 py-3">
          <table className="w-full min-w-[680px] table-auto">
            <MarketHeader />
            <tbody>
              {!tickers && <MarketSkeletonRows />}
              {emptyMessage && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-baseTextMedEmphasis">
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {filtered?.map((m) => <MarketRow market={m} key={m.symbol} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: single-column card list, no horizontal scrolling needed */}
      <div className="flex w-full flex-col overflow-hidden rounded-xl border border-baseBorderLight bg-baseBackgroundL1 md:hidden">
        {!tickers && <MarketSkeletonCards />}
        {emptyMessage && (
          <p className="px-4 py-8 text-center text-sm text-baseTextMedEmphasis">{emptyMessage}</p>
        )}
        {filtered?.map((m) => <MarketCard market={m} key={m.symbol} />)}
      </div>
    </div>
    </PullToRefresh>
  );
};

function MarketSkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-t border-baseBorderLight">
          <td className="px-1 py-3" colSpan={6}>
            <div className="h-10 w-full animate-pulse rounded-md bg-baseBackgroundL2" />
          </td>
        </tr>
      ))}
    </>
  );
}

function MarketSkeletonCards() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-t border-baseBorderLight px-3 py-3 first:border-t-0">
          <div className="h-11 w-full animate-pulse rounded-md bg-baseBackgroundL2" />
        </div>
      ))}
    </>
  );
}

function FavoriteButton({ symbol, favorited, size = 16 }: { symbol: string, favorited: boolean, size?: number }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggleFavorite(symbol); }}
      className={`flex h-11 w-10 shrink-0 items-center justify-center transition active:scale-90 hover:text-amber-400 ${favorited ? "text-amber-400" : "text-baseTextMedEmphasis"}`}
      aria-label="Toggle favorite"
    >
      <Star size={size} fill={favorited ? "currentColor" : "none"} />
    </button>
  );
}

function MarketCard({ market }: { market: Ticker }) {
  const router = useRouter();
  const flash = useFlash(market.lastPrice);
  const animatedPrice = useAnimatedNumber(market.lastPrice);
  const favorites = useFavorites();
  const favorited = favorites.has(market.symbol);
  const isUp = Number(market.priceChangePercent) >= 0;

  return (
    <div
      className="flex w-full cursor-pointer items-center gap-2 border-t border-baseBorderLight px-2 py-2 transition first:border-t-0 active:bg-baseBackgroundL2"
      onClick={() => router.push(`/trade/${market.symbol}`)}
    >
      <FavoriteButton symbol={market.symbol} favorited={favorited} size={18} />
      <CoinIcon symbol={market.symbol} size={36} className="shrink-0 border border-baseBorderMed" />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium text-baseTextHighEmphasis">{getMarketName(market.symbol)}</p>
        <p className="truncate text-xs text-baseTextMedEmphasis">{market.symbol}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <p className={`rounded px-1 -mx-1 text-sm font-semibold tabular-nums text-baseTextHighEmphasis transition-colors duration-500 ${flash === "up" ? "bg-greenBackgroundTransparent" : flash === "down" ? "bg-redBackgroundTransparent" : ""}`}>
          ${animatedPrice}
        </p>
        <p className={`rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums ${isUp ? "bg-greenBackgroundTransparent text-greenText" : "bg-redBackgroundTransparent text-redText"}`}>
          {isUp ? "+" : ""}{(Number(market.priceChangePercent) * 100).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

function MarketRow({ market }: { market: Ticker }) {
  const router = useRouter();
  const flash = useFlash(market.lastPrice);
  const animatedPrice = useAnimatedNumber(market.lastPrice);
  const favorites = useFavorites();
  const favorited = favorites.has(market.symbol);

  return (
    <tr className="w-full cursor-pointer border-t border-baseBorderLight transition hover:bg-baseBackgroundL2" onClick={() => router.push(`/trade/${market.symbol}`)}>
      <td className="w-8 px-1 py-3">
        <FavoriteButton symbol={market.symbol} favorited={favorited} />
      </td>
      <td className="px-1 py-3">
        <div className="flex items-center gap-3">
          <CoinIcon symbol={market.symbol} size={40} className="border border-baseBorderMed" />
          <div className="flex flex-col">
            <p className="whitespace-nowrap text-base font-medium text-baseTextHighEmphasis">
              {getMarketName(market.symbol)}
            </p>
            <p className="text-left text-xs leading-5 text-baseTextMedEmphasis">
              {market.symbol}
            </p>
          </div>
        </div>
      </td>
      <td className="px-1 py-3">
        <p className={`inline-block rounded px-1 -mx-1 text-base font-medium tabular-nums text-baseTextHighEmphasis transition-colors duration-500 ${flash === "up" ? "bg-greenBackgroundTransparent" : flash === "down" ? "bg-redBackgroundTransparent" : ""}`}>
          $ {animatedPrice}
        </p>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums text-baseTextHighEmphasis">$ {market.high}</p>
      </td>
      <td className="px-1 py-3">
        <p className="text-base font-medium tabular-nums text-baseTextHighEmphasis">{market.volume}</p>
      </td>
      <td className="px-1 py-3">
        <p className={"text-base font-medium tabular-nums " + (Number(market.priceChangePercent) >= 0 ? 'text-greenText' : 'text-redText')}>
          {(Number(market.priceChangePercent) * 100).toFixed(2)} %
        </p>
      </td>
    </tr>
  );
}

function MarketHeader() {
  return (
    <thead>
      <tr>
        <th className="px-1 py-3"></th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">Name</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">Price</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">24h High</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">24h Volume</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">24h Change</th>
      </tr>
    </thead>
  );
}
