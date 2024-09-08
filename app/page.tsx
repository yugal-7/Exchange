import { Tile } from "./components/HomeTile"

export default function Home(){

  const newData = [ {
    name: 'MAX/USDC',
    price: 0.311,
    per: 0.81,
    incr: true
  },{
    name: 'MAX/USDC',
    price: 0.311,
    per: 0.81,
    incr: true
  },
  {
    name: 'MAX/USDC',
    price: 0.311,
    per: 0.81,
    incr: true
  },
  {
    name: 'MAX/USDC',
    price: 0.311,
    per: 0.81,
    incr: true
  },
  {
    name: 'MAX/USDC',
    price: 0.311,
    per: 0.81,
    incr: true
  }
 ]

  return (
    <main>
      <div className="mx-auto my-7 bg-landing h-[348px] w-[1200px] border border-black rounded-xl">
          <h1 className="text-[40px] mt-64 ml-12 text-bold">Exchange Made Simple: Fast, Secure, and Reliable</h1>
      </div>
      <div className="flex flex-row justify-center">
        <Tile props={ {title: 'New', data: newData} }/>
        <Tile props={ {title: 'Top Gainers', data: newData} }/>
        <Tile props={ {title: 'Popular', data: newData} }/>
      </div>
    </main>
  )
}