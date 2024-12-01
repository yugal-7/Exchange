import { createSlice } from '@reduxjs/toolkit'

export const tickersSlice = createSlice({
  name: 'tickers',
  initialState: {
    value: []
  },
  reducers: {
    setTickers: (state, action) => {
      state.value = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { setTickers } = tickersSlice.actions

export default tickersSlice.reducer