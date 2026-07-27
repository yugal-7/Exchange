'use client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Ticker } from "../utils/types";
import { CoinIcon } from "./core/CoinIcon";

export const Tile = ({ props }: { props: { title: string, data: Ticker[], loading?: boolean, emptyLabel?: string } }) => {
  const data = props.data;
  const loading = props.loading ?? !data?.length;

  const getName = (name: string) => {
    const index = name.indexOf('_USDC');
    return name.substring(0, index);
  }

  return (
    <Card className="min-h-[230px] w-full flex-1 rounded-xl border-baseBorderLight bg-baseBackgroundL1 p-2 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-baseTextMedEmphasis">{props.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 px-2">
        {loading && (
          <div className="flex flex-col gap-2 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded-md bg-baseBackgroundL2" />
            ))}
          </div>
        )}
        {!loading && !data?.length && (
          <p className="px-3 py-6 text-center text-sm text-baseTextMedEmphasis">
            {props.emptyLabel ?? "Nothing here yet."}
          </p>
        )}
        {!loading && data?.map((d) => (
          <a href={`/trade/${d.symbol}`} key={d.symbol}>
            <div className="flex flex-row items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-baseBackgroundL2">
              <div className="flex w-[40%] flex-row items-center gap-2">
                <CoinIcon symbol={d.symbol} size={20} className="z-10" />
                <p className="truncate font-medium text-baseTextHighEmphasis">{getName(d.symbol)}</p>
              </div>
              <div className="flex w-[30%] justify-end">
                <p className="font-medium tabular-nums text-baseTextHighEmphasis">${d.lastPrice}</p>
              </div>
              <div className="flex w-[30%] justify-end">
                <p className={"font-medium tabular-nums " + (Number(d.priceChangePercent) >= 0 ? 'text-greenText' : 'text-redText')}>
                  {(Number(d.priceChangePercent) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
