'use client';

import { useEffect, useState } from "react";
import { type Ticker } from "../utils/types";
import { getTickers } from "../utils/httpClient";
import { Tile } from "./HomeTile";
import { useAppSelector, useAppDispatch, useAppStore } from '../../lib/hooks';
import {
  setTickers
} from '../../lib/tickers/tickersSlice'

export const Content = ({ tickers } : { tickers: Ticker[] }) => {

  const newMarkets = tickers?.sort((a,b) => Number(a.trades) - Number(b.trades)).slice(0,5);
  const topMarkets = tickers?.sort((a,b) => Number(b.priceChangePercent) - Number(a.priceChangePercent)).slice(0,5);
  const popularMarkets = tickers?.sort((a,b) => Number(b.trades) - Number(a.trades)).slice(0,5);
    // const store = useAppStore()
    // useEffect(() => {
    //     getTickers().then((t: Ticker[]) => store.dispatch(setTickers(t)));
    // })
    // const tickers = useAppSelector(state => state.tickers.value);
    return (
        <div className="flex flex-row justify-evenly">
        <Tile props={ {title: 'New', data: newMarkets} }/>
        <Tile props={ {title: 'Top Gainers', data: topMarkets} }/>
        <Tile props={ {title: 'Popular', data: popularMarkets} }/>
      </div>
      )
}