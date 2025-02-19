interface CryptoData {
  id: number | string;
  amount: number;
  price: number;
  total: number;
  type: 'sell' | 'buy';  // 新增類型來區分顏色
}

interface OrderLevel {
  orders: string;
  price: number;
  quantity: number;
  marker: string;
  accumulatedy: number;
}

interface OrderBook {
  bids: OrderLevel[];
  asks: OrderLevel[];
}

interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface WebSocketResponse {
  id?: number
  method?: string
  code?: number
  result?: {
    channel?: string
    instrument_name?: string
    data?: any[]
  }
}