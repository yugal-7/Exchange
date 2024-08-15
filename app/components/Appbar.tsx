'use client'

import { PrimaryButton, SuccessButton } from "./core/Button"
import { useRouter, usePathname } from "next/navigation"

export const Appbar = () => {
    const route = usePathname();
    const router = useRouter();
    
    return (
    <div className="h-14 border-2 border-white pl-[21px] pr-4 flex flex-col justify-center">
        <div className="flex justify-between">
        <div className="flex items-center">
            <h1 className="font-bold mr-6 cursor-pointer" onClick={() => router.push('/trade/SOL_USDC')}>Yugal's Exchange</h1>
            <div className="ml-[20px] mr-[20px] cursor-pointer" onClick={() => router.push('/markets')}>Markets</div>
            <div className="ml-[20px] mr-[20px]">Trade</div>
        </div>
        <div>
            <PrimaryButton>Deposit</PrimaryButton>
            <SuccessButton>Withdraw</SuccessButton>
        </div>
    </div>
    </div>)
}