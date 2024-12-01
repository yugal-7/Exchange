import { configureStore } from '@reduxjs/toolkit'
import tickersReducer from './tickers/tickersSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
        tickers: tickersReducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']