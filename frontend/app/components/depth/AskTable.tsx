export const AskTable = ({ asks }: { asks: [string, string][] }) => {
    let currentTotal = 0;
    const relevantAsks = asks.slice(0, 15);
    relevantAsks.reverse();

    const asksWithTotal: [string, string, number][] = [];
    for (let i = relevantAsks.length - 1; i >= 0; i--) {
        const [price, quantity] = relevantAsks[i];
        asksWithTotal.push([price, quantity, currentTotal += Number(quantity)]);
    }
    const maxTotal = relevantAsks.reduce((acc, [, quantity]) => acc + Number(quantity), 0);
    asksWithTotal.reverse();

    return <div className="flex flex-col">
        {asksWithTotal.map(([price, quantity, total]) => <Ask maxTotal={maxTotal} key={price} price={price} quantity={quantity} total={total} />)}
    </div>
}

function Ask({ price, quantity, total, maxTotal }: { price: string, quantity: string, total: number, maxTotal: number }) {
    return <div className="relative flex w-full overflow-hidden rounded-sm">
        <div
            className="absolute left-0 top-0 h-full bg-redBackgroundTransparent transition-[width] duration-300 ease-in-out"
            style={{ width: `${(100 * total) / maxTotal}%` }}
        />
        <div className="flex w-full justify-between px-1 py-0.5 text-xs tabular-nums">
            <div className="text-redText">{price}</div>
            <div className="text-baseTextHighEmphasis">{quantity}</div>
            <div className="text-baseTextMedEmphasis">{total?.toFixed(2)}</div>
        </div>
    </div>
}
