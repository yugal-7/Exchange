"use client";

import { useEffect, useState } from "react";
import { getDepth, getKlines, getTicker, getTrades } from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";

interface Trade{
    price: string;
    quantity: string;
    time: number,
    a: number,
    b: number
}

export function Depth({ market }: {market: string}) {
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();
    const [price, setPrice] = useState<string>();
    const [trades, setTrades] = useState<Trade[]>([]);

    useEffect(() => {
        getDepth(market).then(d => {
            setBids(d.bids.reverse());
            setAsks(d.asks);
        });

        getTicker(market).then(t => setPrice(t.lastPrice));

        SignalingManager.getInstance().registerCallback('depth', (data: any)=>{
            setBids((oldBids) => {
                const newBids = [...(oldBids || [])];
                for(let i=0;i<newBids?.length;i++){
                    for(let j=0;j<data.bids.length;j++){
                        if(newBids[i][0] == data.bids[j][0]){
                            newBids[i][1] = data.bids[j][1];
                        }
                    }
                }
                return newBids;
            });
            setAsks((oldAsks) => {
                const newAsks = [...(oldAsks || [])];
                for(let i=0;i<newAsks?.length;i++){
                    for(let j=0;j<data.asks.length;j++){
                        if(newAsks[i][0] == data.asks[j][0]){
                            newAsks[i][1] = data.asks[j][1];
                        }
                    }
                }
                return newAsks;
            });
        }, `DEPTH-${market}`)

        SignalingManager.getInstance().sendMessage({"method":"SUBSCRIBE","params":[`depth.${market}`]}	);

        SignalingManager.getInstance().registerCallback('trade', (data: Trade) => {
            console.log(data);
            setTrades((oldTrades) => {
                const newTrades = [...oldTrades];
                newTrades.unshift(data);
                return newTrades.slice(0,10);
            })
        }, `TRADE-${market}`)

        SignalingManager.getInstance().sendMessage({"method":"SUBSCRIBE","params":[`trade.${market}`]}	);

        return () => {
            SignalingManager.getInstance().deRegisterCallback("depth", `TRADE-${market}`);
            SignalingManager.getInstance().sendMessage({"method":"UNSUBSCRIBE","params":[`trade.${market}`]});
            SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
            SignalingManager.getInstance().sendMessage({"method":"UNSUBSCRIBE","params":[`depth.${market}`]}	);
        }
    }, [market])
    
    return <div>
        <TableHeader />
        <Trades trades={trades}/>
        {asks && <AskTable asks={asks} />}
        {price && <div>{price}</div>}
        {bids && <BidTable bids={bids} />}
    </div>
}

function Trades({trades}:{trades: Trade[]}){
    return <div>
        {
            trades.map((trade) => {
                return <div className={trade.a > trade.b ? 'text-red-500' : 'text-green-500'}>
                    <span className="mx-1">{trade.price}</span>
                    <span className="mx-1">{trade.quantity}</span>
                    <span className="mx-1">{new Date(trade.time).getHours()}</span>
                </div>
            })
        }
    </div>
}

function TableHeader() {
    return <div className="flex justify-between text-xs">
    <div className="text-white">Price</div>
    <div className="text-slate-500">Size</div>
    <div className="text-slate-500">Total</div>
</div>
}