'use client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Ticker } from "../utils/types";
import { CoinIcon } from "./core/CoinIcon";
import { useFlash } from "../utils/useFlash";

export const Tile = ({ props }: { props: { title: string, data: Ticker[], loading?: boolean, emptyLabel?: string, hideHeader?: boolean } }) => {
  const data = props.data;
  const loading = props.loading ?? !data?.length;

  return (
    <Card className="flex min-h-[268px] w-full flex-1 flex-col rounded-xl border-baseBorderLight bg-baseBackgroundL1 p-2 shadow-sm transition hover:border-baseBorderMed">
      {/* On mobile the segmented tab above already names the list, so the
          card header would just repeat it. */}
      {!props.hideHeader && (
        <CardHeader className="px-4 pb-3 pt-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-baseTextMedEmphasis">
            {props.title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-0.5 px-2 pb-2">
        {loading && (
          <div className="flex flex-col gap-2 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-11 w-full animate-pulse rounded-md bg-baseBackgroundL2" />
            ))}
          </div>
        )}
        {!loading && !data?.length && (
          <p className="px-3 py-8 text-center text-sm text-baseTextMedEmphasis">
            {props.emptyLabel ?? "Nothing here yet."}
          </p>
        )}
        {!loading && data?.map((d, i) => <TileRow key={d.symbol} ticker={d} rank={i + 1} />)}
      </CardContent>
    </Card>
  )
}

function TileRow({ ticker, rank }: { ticker: Ticker, rank: number }) {
  const flash = useFlash(ticker.lastPrice);
  const pct = Number(ticker.priceChangePercent) * 100;
  const isUp = pct >= 0;
  const base = ticker.symbol.split("_")[0];

  return (
    <a href={`/trade/${ticker.symbol}`}>
      <div className="flex min-h-[44px] flex-row items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-baseBackgroundL2 active:bg-baseBackgroundL3">
        <span className="w-3 shrink-0 text-xs font-medium tabular-nums text-baseTextLowEmphasis">{rank}</span>
        <CoinIcon symbol={ticker.symbol} size={24} />
        <p className="min-w-0 flex-1 truncate font-medium text-baseTextHighEmphasis">{base}</p>
        <p
          className={`shrink-0 rounded px-1 -mx-1 font-medium tabular-nums text-baseTextHighEmphasis transition-colors duration-500 ${
            flash === "up" ? "bg-greenBackgroundTransparent" : flash === "down" ? "bg-redBackgroundTransparent" : ""
          }`}
        >
          ${ticker.lastPrice}
        </p>
        <p className={`w-[62px] shrink-0 text-right text-xs font-semibold tabular-nums ${isUp ? "text-greenText" : "text-redText"}`}>
          {isUp ? "+" : ""}{pct.toFixed(2)}%
        </p>
      </div>
    </a>
  );
}
