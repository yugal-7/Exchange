"use client";

import { useEffect, useState } from "react";
import { getDepth, getTicker } from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";

export function Depth({ market }: { market: string }) {
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();
    const [price, setPrice] = useState<string>();
    const [priceUp, setPriceUp] = useState<boolean>(true);

    useEffect(() => {
        getDepth(market).then(d => {
            setBids(d.bids.reverse());
            setAsks(d.asks);
        });

        getTicker(market).then(t => {
            setPrice(t.lastPrice);
            setPriceUp(Number(t.priceChange) >= 0);
        });

        SignalingManager.getInstance().registerCallback('depth', (data: any) => {
            setBids((oldBids) => {
                const newBids = [...(oldBids || [])];
                for (let i = 0; i < newBids?.length; i++) {
                    for (let j = 0; j < data.bids.length; j++) {
                        if (newBids[i][0] == data.bids[j][0]) {
                            newBids[i][1] = data.bids[j][1];
                        }
                    }
                }
                return newBids;
            });
            setAsks((oldAsks) => {
                const newAsks = [...(oldAsks || [])];
                for (let i = 0; i < newAsks?.length; i++) {
                    for (let j = 0; j < data.asks.length; j++) {
                        if (newAsks[i][0] == data.asks[j][0]) {
                            newAsks[i][1] = data.asks[j][1];
                        }
                    }
                }
                return newAsks;
            });
        }, `DEPTH-${market}`)

        SignalingManager.getInstance().sendMessage({ "method": "SUBSCRIBE", "params": [`depth.${market}`] });

        SignalingManager.getInstance().registerCallback('ticker', (data: any) => {
            if (data?.lastPrice) {
                setPrice(data.lastPrice);
            }
            if (data?.priceChange !== undefined) {
                setPriceUp(Number(data.priceChange) >= 0);
            }
        }, `DEPTH-TICKER-${market}`);
        SignalingManager.getInstance().sendMessage({ "method": "SUBSCRIBE", "params": [`ticker.${market}`] });

        return () => {
            SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
            SignalingManager.getInstance().sendMessage({ "method": "UNSUBSCRIBE", "params": [`depth.${market}`] });
            SignalingManager.getInstance().deRegisterCallback("ticker", `DEPTH-TICKER-${market}`);
            SignalingManager.getInstance().sendMessage({ "method": "UNSUBSCRIBE", "params": [`ticker.${market}`] });
        }
    }, [market])

    return <div className="flex flex-col gap-1 px-2 py-2">
        <TableHeader />
        {asks ? <AskTable asks={asks} /> : <SkeletonRows />}
        {price && (
            <div className={`py-1.5 text-lg font-semibold tabular-nums ${priceUp ? "text-greenText" : "text-redText"}`}>
                {price}
            </div>
        )}
        {bids ? <BidTable bids={bids} /> : <SkeletonRows />}
    </div>
}

function SkeletonRows() {
    return <div className="flex flex-col gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-baseBackgroundL2" />
        ))}
    </div>
}

function TableHeader() {
    return <div className="flex justify-between pb-1 text-xs font-medium text-baseTextMedEmphasis">
        <div>Price</div>
        <div>Size</div>
        <div>Total</div>
    </div>
}
