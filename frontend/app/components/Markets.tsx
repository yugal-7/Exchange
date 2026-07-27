"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { Ticker } from "../utils/types";
import { getTickers } from "../utils/httpClient";
import { useRouter } from "next/navigation";
import { CoinIcon } from "./core/CoinIcon";
import { useFlash } from "../utils/useFlash";
import { toggleFavorite, useFavorites } from "../utils/favorites";

export const Markets = () => {
  const [tickers, setTickers] = useState<Ticker[]>();
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const favorites = useFavorites();

  useEffect(() => {
    getTickers().then((m) => setTickers(m.sort((a, b) => Number(b.lastPrice) - Number(a.lastPrice))));
  }, []);

  const filtered = useMemo(() => {
    if (!tickers) return tickers;
    const q = query.trim().toLowerCase();
    return tickers.filter((t) => {
      if (favoritesOnly && !favorites.has(t.symbol)) return false;
      if (!q) return true;
      return t.symbol.toLowerCase().includes(q);
    });
  }, [tickers, query, favoritesOnly, favorites]);

  return (
    <div className="flex w-full max-w-[1280px] flex-1 flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-baseTextHighEmphasis">Markets</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-baseTextMedEmphasis" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search markets..."
              className="h-9 w-full rounded-lg border border-baseBorderLight bg-baseBackgroundL1 py-1.5 pl-9 pr-3 text-sm text-baseTextHighEmphasis placeholder-baseTextMedEmphasis outline-none transition focus:border-accentBlue sm:w-56"
            />
          </div>
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            title="Show favorites only"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
              favoritesOnly
                ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                : "border-baseBorderLight text-baseTextMedEmphasis hover:border-baseBorderFocus hover:text-baseTextHighEmphasis"
            }`}
          >
            <Star size={16} fill={favoritesOnly ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      <div className="relative w-full rounded-xl border border-baseBorderLight bg-baseBackgroundL1">
        <div className="flex w-full flex-col overflow-x-auto px-5 py-3">
          <table className="w-full min-w-[680px] table-auto">
            <MarketHeader />
            <tbody>
              {!tickers && <MarketSkeletonRows />}
              {tickers && filtered?.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-baseTextMedEmphasis">
                    No markets match &quot;{query}&quot;.
                  </td>
                </tr>
              )}
              {filtered?.map((m) => <MarketRow market={m} key={m.symbol} />)}
            </tbody>
          </table>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 rounded-r-xl bg-gradient-to-l from-baseBackgroundL1 to-transparent sm:hidden" />
      </div>
    </div>
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

function MarketRow({ market }: { market: Ticker }) {
  const router = useRouter();
  const flash = useFlash(market.lastPrice);
  const favorites = useFavorites();
  const favorited = favorites.has(market.symbol);

  const getMarketName = (name: string) => {
    const index = name.indexOf('_USDC');
    return name.substring(0, index);
  }

  return (
    <tr className="w-full cursor-pointer border-t border-baseBorderLight transition hover:bg-baseBackgroundL2" onClick={() => router.push(`/trade/${market.symbol}`)}>
      <td className="w-8 px-1 py-3">
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(market.symbol); }}
          className={`flex h-6 w-6 items-center justify-center transition hover:text-amber-400 ${favorited ? "text-amber-400" : "text-baseTextMedEmphasis"}`}
          aria-label="Toggle favorite"
        >
          <Star size={16} fill={favorited ? "currentColor" : "none"} />
        </button>
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
          $ {market.lastPrice}
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
