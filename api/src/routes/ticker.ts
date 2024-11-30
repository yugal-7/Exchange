
import { Router } from "express";

export const tickersRouter = Router();

tickersRouter.get("/", async (req, res) => {    
   const response = await fetch('https://api.backpack.exchange/api/v1/tickers');
   const data = await response.json();
   res.json(data);
});