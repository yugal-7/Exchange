'use client'
import { Content } from "./components/Content" 

import { useEffect, useState } from "react";
import { type Ticker } from "./utils/types";
import { getTickers } from "./utils/httpClient";

export default function Home(){
  const [tickers, setTickers] = useState<Ticker[]>([]);

  useEffect(() => {
    getTickers().then((m) => setTickers(m));
  }, []);
  return (
    <main>
      <div className="mx-auto mt-7 bg-landing h-[348px] w-[1200px] border border-black rounded-xl">
          <h1 className="text-[40px] mt-64 ml-12 text-bold">Exchange Made Simple: Fast, Secure, and Reliable</h1>
      </div>
     <Content tickers={tickers}/>
    </main>
  )
}