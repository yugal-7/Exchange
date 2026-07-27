export const BidTable = ({ bids }: { bids: [string, string][] }) => {
    let currentTotal = 0;
    const relevantBids = bids.slice(0, 15);
    const bidsWithTotal: [string, string, number][] = relevantBids.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
    const maxTotal = relevantBids.reduce((acc, [, quantity]) => acc + Number(quantity), 0);

    return <div className="flex flex-col">
        {bidsWithTotal?.map(([price, quantity, total]) => <Bid maxTotal={maxTotal} total={total} key={price} price={price} quantity={quantity} />)}
    </div>
}

function Bid({ price, quantity, total, maxTotal }: { price: string, quantity: string, total: number, maxTotal: number }) {
    return (
        <div className="relative flex w-full overflow-hidden rounded-sm">
            <div
                className="absolute left-0 top-0 h-full bg-greenBackgroundTransparent transition-[width] duration-300 ease-in-out"
                style={{ width: `${(100 * total) / maxTotal}%` }}
            />
            <div className="flex w-full justify-between px-1 py-0.5 text-xs tabular-nums">
                <div className="text-greenText">{price}</div>
                <div className="text-baseTextHighEmphasis">{quantity}</div>
                <div className="text-baseTextMedEmphasis">{total.toFixed(2)}</div>
            </div>
        </div>
    );
}
