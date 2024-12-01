'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
export const Tile = ({props}:any) => {
    const data = props.data;

    const getName = (name: string) => {
      const index = name.indexOf('_USDC');
      return name.substring(0,index);
    }

    return <Card className="rounded-lg bg-baseBackgroundL1 shadow-sm text-base p-2 min-h-[230px] w-full px-0 m-7">
    <CardHeader>
      <CardTitle>{props.title}</CardTitle>
    </CardHeader>
    <CardContent>
    {
        data.map((d: any) => { 
          return  <a href={`/trade/${d.symbol}`} key={d.name}><div className="flex items-center justify-between flex-row cursor-pointer px-5 py-2 !text-sm rounded-md hover:bg-zinc-800">
            <div className="flex flex-row w-[40%]">
             
            <div className="flex items-center flex-row gap-2 w-full">
              <div className="flex flex-row relative shrink-0">
                <img alt="GOAT Logo" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" className="z-10 rounded-full"
                src={`https://backpack.exchange/_next/image?url=%2Fcoins%2F${getName(d.symbol).toLowerCase()}.png&w=48&q=75`}/></div>
                <p className="font-medium text-nowrap text-baseTextHighEmphasis !font-normal">{getName(d.symbol)}</p></div></div><div className="flex justify-end flex-row w-[30%]">
                  <p className="font-medium text-baseTextHighEmphasis !font-normal tabular-nums">${d.lastPrice}</p></div>
                  <div className="flex justify-end flex-row w-[30%]">
                    <p className={"font-medium tabular-nums " + (Number(d.priceChangePercent) >= 0 ? 'text-green-600':'text-rose-600')}>{(Number(d.priceChangePercent) * 100).toFixed(2)}%</p>
                    </div>
                    </div>
                    </a>
                    
       })
      }
    </CardContent>
  </Card>
  
    return <div className="w-[394px] h-[242px] bg-zinc-900 mr-4 p-4">
        <h1 className="text-xl">{props.title}</h1>
       {
        data.map((d: any) => { 
             return <div className="flex flex-row justify-between" key={d.name}>
             <span>{d.symbol}</span>
             <span>{d.lastPrice}</span>
             <span>{d.priceChangePercent}</span>
         </div>
       })
      }
       
    </div>
}