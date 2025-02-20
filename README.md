#  vue3-kline-best5-dashboard
![image](https://img.shields.io/badge/node-v22.13.1-green.svg) 
![image](https://img.shields.io/badge/vue-v3.5.13-brightgreen.svg)   
![image](https://img.shields.io/badge/typescript-blue.svg) ![image](https://img.shields.io/badge/pnpm-985F2A.svg) 
 
使用 Vue3 + Vite 開發而成的 Dashboard，接取交易所 [Crypto.com](https://crypto.com/) api

## 功能說明
### 最佳五檔
![localhost_5173_](https://github.com/user-attachments/assets/27368442-f57c-4e60-be67-d152dd2b5232)
- 即時更新交易對的最佳五檔
- 同時顯示六個交易對資料 ( 有處理簡易 RWD，詳[後續說明](#畫面說明) )
- 因 `book.{instrument_name}` 已[棄用](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name)，改用 `book.{instrument_name}.{depth}` [接取](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name-depth)資料

### K線圖
![localhost_5173_ (1)](https://github.com/user-attachments/assets/a805bfc8-2a38-462a-b039-6b1d801956bc)
- 顯示相對應之交易對的K線圖
- 由左方卡片點取叫出
- 使用 `candlestick.{time_frame}.{instrument_name}` [接取](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name)資料

## 畫面說明
![localhost_5173_ (3)](https://github.com/user-attachments/assets/42cbbaaa-195d-4bc1-bc94-bbec30541fde)
