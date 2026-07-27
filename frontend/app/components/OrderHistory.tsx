'use client'
import { useOrders } from "../utils/orders";

export function OrderHistory({ market }: { market: string }) {
    const orders = useOrders().filter((o) => o.market === market);

    return (
        <div className="mt-4 flex w-full flex-col rounded-xl border border-baseBorderLight bg-baseBackgroundL1 p-4">
            <h2 className="mb-3 text-sm font-semibold text-baseTextHighEmphasis">Recent Orders</h2>
            {orders.length === 0 ? (
                <p className="py-4 text-center text-sm text-baseTextMedEmphasis">
                    No demo orders placed for {market.replace('_', '/')} yet.
                </p>
            ) : (
                <div className="flex flex-col overflow-x-auto">
                    <table className="w-full min-w-[520px] table-auto text-sm">
                        <thead>
                            <tr className="text-left text-xs font-normal text-baseTextMedEmphasis">
                                <th className="py-2 pr-4">Time</th>
                                <th className="py-2 pr-4">Side</th>
                                <th className="py-2 pr-4">Type</th>
                                <th className="py-2 pr-4">Price</th>
                                <th className="py-2 pr-4">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} className="border-t border-baseBorderLight">
                                    <td className="py-2 pr-4 text-baseTextMedEmphasis tabular-nums">
                                        {new Date(order.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className={`py-2 pr-4 font-medium capitalize ${order.side === 'buy' ? 'text-greenText' : 'text-redText'}`}>
                                        {order.side}
                                    </td>
                                    <td className="py-2 pr-4 capitalize text-baseTextHighEmphasis">{order.type}</td>
                                    <td className="py-2 pr-4 tabular-nums text-baseTextHighEmphasis">
                                        {order.type === 'market' ? 'Market' : order.price}
                                    </td>
                                    <td className="py-2 pr-4 tabular-nums text-baseTextHighEmphasis">{order.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
