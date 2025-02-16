interface CryptoData {
  id: number;
  amount: number;
  price: number;
  total: number;
  type: 'sell' | 'buy';  // 新增類型來區分顏色
}

interface OrderLevel {
  price: number;
  quantity: number;
  marker: string;
}

interface OrderBook {
  bids: OrderLevel[];
  asks: OrderLevel[];
}