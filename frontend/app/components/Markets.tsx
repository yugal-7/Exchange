"use client";

import { useEffect, useState } from "react";
import { Ticker } from "../utils/types";
import { getTickers } from "../utils/httpClient";
import { useRouter } from "next/navigation";

export const Markets = () => {
  const [tickers, setTickers] = useState<Ticker[]>();

  useEffect(() => {
    getTickers().then((m) => setTickers(m.sort((a, b) => Number(b.lastPrice) - Number(a.lastPrice))));
  }, []);

  return (
    <div className="flex w-full max-w-[1280px] flex-1 flex-col">
      <h1 className="mb-4 text-2xl font-semibold text-baseTextHighEmphasis">Markets</h1>
      <div className="flex w-full flex-col overflow-x-auto rounded-xl border border-baseBorderLight bg-baseBackgroundL1 px-5 py-3">
        <table className="w-full min-w-[640px] table-auto">
          <MarketHeader />
          <tbody>
            {!tickers && <MarketSkeletonRows />}
            {tickers?.map((m) => <MarketRow market={m} key={m.symbol} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function MarketSkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-t border-baseBorderLight">
          <td className="px-1 py-3" colSpan={5}>
            <div className="h-10 w-full animate-pulse rounded-md bg-baseBackgroundL2" />
          </td>
        </tr>
      ))}
    </>
  );
}

function MarketRow({ market }: { market: Ticker }) {
  const router = useRouter();

  const getMarketName = (name: string) => {
    const index = name.indexOf('_USDC');
    return name.substring(0, index);
  }

  return (
    <tr className="w-full cursor-pointer border-t border-baseBorderLight transition hover:bg-baseBackgroundL2" onClick={() => router.push(`/trade/${market.symbol}`)}>
      <td className="px-1 py-3">
        <div className="flex items-center gap-3">
          <div
            className="relative flex-none overflow-hidden rounded-full border border-baseBorderMed"
            style={{ width: "40px", height: "40px" }}
          >
            <img
              alt={market.symbol}
              src={`https://backpack.exchange/coins/${getMarketName(market.symbol).toLowerCase()}.svg`}
              loading="lazy"
              width="40"
              height="40"
              decoding="async"
            />
          </div>
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
        <p className="text-base font-medium tabular-nums text-baseTextHighEmphasis">$ {market.lastPrice}</p>
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
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">Name</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">Price</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">24h High</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">24h Volume</th>
        <th className="px-2 py-3 text-left text-sm font-normal text-baseTextMedEmphasis">24h Change</th>
      </tr>
    </thead>
  );
}
