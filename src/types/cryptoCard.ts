interface CryptoData {
  id: number;
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