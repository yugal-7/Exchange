"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { OrderHistory } from "@/app/components/OrderHistory";
import { useParams } from "next/navigation";

export default function Page() {
    const { market } = useParams();
    const marketId = market as string;

    return <div className="mx-auto flex w-full max-w-[1280px] flex-col">
        <div className="flex w-full flex-col overflow-hidden rounded-xl border border-baseBorderLight">
            <MarketBar market={marketId} />
            {/*
              Single flex row reordered per breakpoint: on mobile the Buy/Sell
              panel sits right after the chart (order-2) so trading doesn't
              require scrolling past the full order book (order-3). On lg+
              screens it reverts to the desktop layout: chart | order book | swap.
            */}
            <div className="flex flex-col lg:h-[560px] lg:flex-row lg:border-y lg:border-baseBorderLight">
                <div className="order-1 h-[420px] lg:h-full lg:flex-1">
                    <TradeView market={marketId} />
                </div>
                <div className="order-2 w-full border-t border-baseBorderLight bg-baseBackgroundL1 lg:order-3 lg:h-full lg:w-[280px] lg:overflow-y-auto lg:border-l lg:border-t-0">
                    <SwapUI market={marketId} />
                </div>
                <div className="order-3 flex w-full flex-col overflow-hidden border-t border-baseBorderLight lg:order-2 lg:h-full lg:w-[250px] lg:border-l lg:border-t-0">
                    <Depth market={marketId} />
                </div>
            </div>
        </div>
        <OrderHistory market={marketId} />
    </div>
}
