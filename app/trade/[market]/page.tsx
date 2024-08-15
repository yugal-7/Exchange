"use client";
import { MarketBar } from "@/app/components/MarketBar";
// import { SwapUI } from "@/app/components/SwapUI";
// import { TradeView } from "@/app/components/TradeView";
// import { Depth } from "@/app/components/depth/Depth";
import { useParams } from "next/navigation";


export default function Page(){
    const { market } = useParams();
    return <div className="flex flex-row flex-1">
        <MarketBar market={market as string} />
    </div>
}