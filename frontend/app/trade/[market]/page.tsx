"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { useParams } from "next/navigation";

export default function Page() {
    const { market } = useParams();

    return <div className="mx-auto flex w-full max-w-[1280px] flex-col overflow-hidden rounded-xl border border-baseBorderLight lg:flex-row">
        <div className="flex flex-1 flex-col">
            <MarketBar market={market as string} />
            <div className="flex flex-col border-baseBorderLight md:h-[560px] md:flex-row md:border-y">
                <div className="h-[420px] flex-1 md:h-full">
                    <TradeView market={market as string} />
                </div>
                <div className="border-baseBorderLight md:w-[1px] md:border-l" />
                <div className="flex w-full flex-col overflow-hidden border-t border-baseBorderLight md:w-[250px] md:border-t-0">
                    <Depth market={market as string} />
                </div>
            </div>
        </div>
        <div className="border-baseBorderLight md:w-[1px] md:border-l" />
        <div className="w-full border-t border-baseBorderLight bg-baseBackgroundL1 md:w-[280px] md:border-t-0">
            <SwapUI market={market as string} />
        </div>
    </div>
}
