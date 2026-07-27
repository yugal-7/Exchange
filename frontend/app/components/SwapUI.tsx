"use client";
import { useMemo, useState } from "react";
import { useSession } from "../utils/session";
import { requestAuth } from "../utils/authModalRequest";
import { showToast } from "../utils/toast";

const AVAILABLE_BALANCE = 36.94;

export function SwapUI({ market }: { market: string }) {
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [type, setType] = useState('limit');
    const session = useSession();

    const [base, quote] = market.split('_');

    const total = useMemo(() => {
        const p = Number(price);
        const q = Number(quantity);
        if (!p || !q) return 0;
        return p * q;
    }, [price, quantity]);

    const applyPercent = (percent: number) => {
        const p = Number(price);
        if (!p) return;
        const spend = (AVAILABLE_BALANCE * percent) / 100;
        setQuantity((spend / p).toFixed(4));
    };

    const isBuy = activeTab === 'buy';
    const canSubmit = Number(quantity) > 0 && (type === 'market' || Number(price) > 0);

    const submit = () => {
        if (!session) {
            showToast('Sign in to place an order', 'info');
            requestAuth('signin');
            return;
        }
        if (!canSubmit) {
            showToast(type === 'limit' ? 'Enter a valid price and quantity' : 'Enter a valid quantity', 'error');
            return;
        }
        const label = type === 'limit' ? `@ ${price} ${quote}` : 'at market price';
        showToast(`${isBuy ? 'Buy' : 'Sell'} order placed: ${quantity} ${base} ${label} (demo)`, 'success');
        setQuantity('');
        setPrice('');
    };

    return <div>
        <div className="flex flex-col">
            <div className="flex flex-row h-[60px]">
                <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
                <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="flex flex-col gap-1">
                <div className="px-3">
                    <div className="flex flex-row flex-0 gap-5">
                        <LimitButton type={type} setType={setType} />
                        <MarketButton type={type} setType={setType} />
                    </div>
                </div>
                <div className="flex flex-col px-3">
                    <div className="flex flex-col flex-1 gap-3 text-baseTextHighEmphasis">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between flex-row">
                                <p className="text-xs font-normal text-baseTextMedEmphasis">Available Balance</p>
                                <p className="font-medium text-xs text-baseTextHighEmphasis">{AVAILABLE_BALANCE} {quote}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-normal text-baseTextMedEmphasis">
                                Price
                            </p>
                            <div className="flex flex-col relative">
                                <input
                                    step="0.01"
                                    placeholder="0"
                                    disabled={type === 'market'}
                                    className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-baseBackgroundL1 pr-14 text-right text-2xl leading-9 text-baseTextHighEmphasis placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:outline-none disabled:opacity-50"
                                    type="text"
                                    value={type === 'market' ? '' : price}
                                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                                />
                                <div className="flex flex-row absolute right-3 top-1/2 -translate-y-1/2">
                                    <p className="text-xs font-medium text-baseTextMedEmphasis">{quote}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-normal text-baseTextMedEmphasis">
                            Quantity
                        </p>
                        <div className="flex flex-col relative">
                            <input
                                step="0.01"
                                placeholder="0"
                                className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-baseBackgroundL1 pr-14 text-right text-2xl leading-9 text-baseTextHighEmphasis placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:outline-none"
                                type="text"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ''))}
                            />
                            <div className="flex flex-row absolute right-3 top-1/2 -translate-y-1/2">
                                <p className="text-xs font-medium text-baseTextMedEmphasis">{base}</p>
                            </div>
                        </div>
                        <div className="flex justify-end flex-row">
                            <p className="font-medium pr-2 text-xs text-baseTextMedEmphasis">≈ {total.toFixed(2)} {quote}</p>
                        </div>
                        <div className="flex justify-center flex-row mt-2 gap-3">
                            {[25, 50, 75, 100].map((percent) => (
                                <button
                                    key={percent}
                                    type="button"
                                    onClick={() => applyPercent(percent)}
                                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 text-baseTextMedEmphasis transition hover:bg-baseBackgroundL3 hover:text-baseTextHighEmphasis"
                                >
                                    {percent === 100 ? 'Max' : `${percent}%`}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!!session && !canSubmit}
                            className={`font-semibold focus:outline-none text-center h-12 rounded-xl text-base px-4 py-2 my-4 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${isBuy ? 'bg-greenPrimaryButtonBackground text-greenPrimaryButtonText' : 'bg-redPrimaryButtonBackground text-redPrimaryButtonText'}`}
                        >
                            {session ? `${isBuy ? 'Buy' : 'Sell'} ${base}` : 'Sign in to trade'}
                        </button>
                        <div className="flex justify-between flex-row mt-1">
                            <div className="flex flex-row gap-2">
                                <div className="flex items-center">
                                    <input className="h-4 w-4 cursor-pointer rounded border border-baseBorderMed bg-baseBackgroundL1" id="postOnly" type="checkbox" />
                                    <label htmlFor="postOnly" className="ml-2 text-xs text-baseTextMedEmphasis">Post Only</label>
                                </div>
                                <div className="flex items-center">
                                    <input className="h-4 w-4 cursor-pointer rounded border border-baseBorderMed bg-baseBackgroundL1" id="ioc" type="checkbox" />
                                    <label htmlFor="ioc" className="ml-2 text-xs text-baseTextMedEmphasis">IOC</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

function LimitButton({ type, setType }: { type: string, setType: (t: string) => void }) {
    return <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('limit')}>
        <div className={`text-sm font-medium py-1 border-b-2 ${type === 'limit' ? "border-accentBlue text-baseTextHighEmphasis" : "border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"}`}>
            Limit
        </div>
    </div>
}

function MarketButton({ type, setType }: { type: string, setType: (t: string) => void }) {
    return <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('market')}>
        <div className={`text-sm font-medium py-1 border-b-2 ${type === 'market' ? "border-accentBlue text-baseTextHighEmphasis" : "border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"} `}>
            Market
        </div>
    </div>
}

function BuyButton({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: 'buy' | 'sell') => void }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'buy' ? 'border-b-greenBorder bg-greenBackgroundTransparent' : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'}`} onClick={() => setActiveTab('buy')}>
        <p className="text-center text-sm font-semibold text-greenText">
            Buy
        </p>
    </div>
}

function SellButton({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: 'buy' | 'sell') => void }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'sell' ? 'border-b-redBorder bg-redBackgroundTransparent' : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'}`} onClick={() => setActiveTab('sell')}>
        <p className="text-center text-sm font-semibold text-redText">
            Sell
        </p>
    </div>
}
