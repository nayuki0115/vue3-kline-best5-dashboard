#  vue3-kline-best5-dashboard
![image](https://img.shields.io/badge/node-v22.13.1-green.svg) 
![image](https://img.shields.io/badge/vue-v3.5.13-brightgreen.svg)   
![image](https://img.shields.io/badge/typescript-blue.svg) ![image](https://img.shields.io/badge/pnpm-985F2A.svg) 
 
使用 Vue3 + Vite 開發而成的 Dashboard，接取交易所 [Crypto.com](https://crypto.com/) api

## 功能說明
### 最佳五檔
![localhost_5173_](https://github.com/user-attachments/assets/27368442-f57c-4e60-be67-d152dd2b5232)
- 即時更新交易對的最佳五檔
- 同時顯示六個交易對資料 ( 有處理簡易 RWD，詳[後續說明](#rwd) )
- 因 `book.{instrument_name}` 已[棄用](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name)，改用 `book.{instrument_name}.{depth}` [接取](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name-depth)資料
- 點取卡片可叫出[K線圖](K線圖)燈箱

### K線圖
![localhost_5173_ (1)](https://github.com/user-attachments/assets/a805bfc8-2a38-462a-b039-6b1d801956bc)
- 顯示相對應之交易對的K線圖
- 由左方卡片點取叫出
- 使用 `candlestick.{time_frame}.{instrument_name}` [接取](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name)資料
- 如何關閉燈箱？
  - 該功能視窗右上的叉叉關閉
  - 按左邊卡片區
    -  按原卡片：關閉
    -  按別張卡片：叫出相對應的交易對K線圖燈箱

## 畫面說明
### 基本畫面
如[功能說明](#功能說明)區塊的兩張圖片
- 畫面左半邊為「最佳五檔」卡片區
- 畫面右半邊為「K線圖」燈箱區
### RWD
![localhost_5173_ (3)](https://github.com/user-attachments/assets/42cbbaaa-195d-4bc1-bc94-bbec30541fde)
#### breakpoint
- 寬超過 1600px
  - 卡片：於畫面左半邊，一排三張卡片，共二排
  - 燈箱：於畫面右半邊，與卡片並行，預設高度為畫面可視範圍
- 寬超過 1200px 並且小於 1600px
  - 卡片：於畫面左半邊，一排兩張卡片，共三排
  - 燈箱：於畫面右半邊，與卡片並行，預設高度為畫面可視範圍，在左邊卡片往下滑時，燈箱仍固定在右半邊
- 寬超過 768ppx 並且小於 1200px
  - 卡片：於畫面上半部，一排兩張卡片，共三排
  - 燈箱：於卡片下方
- 寬小於 768ppx
  - 卡片：於畫面上半部，一排一張卡片，共六排
  - 燈箱：於卡片下方

## 使用技術
![image](https://img.shields.io/badge/vue-v3.5.13-brightgreen.svg) ![image](https://img.shields.io/badge/typescript-blue.svg)  

## 安裝和運行說明
![image](https://img.shields.io/badge/node-v22.13.1-green.svg) 
```bash
git clone <repository-url>
cd <project-name>
pnpm install
pnpm run dev
```
## 專案結構
```tree
src/
├── src/
│   ├── components/      # 共用元件
│   ├── composables/     # Vue3 組合式函數
│   ├── router/          # 路由配置
│   ├── types/           # TypeScript 型別定義
│   ├── views/           # 頁面元件
│   ├── App.vue          # 根元件
│   └── main.ts          # 應用入口
├── public/              # 公共資源
├── index.html           # HTML 模板
├── package.json         # 套件配置
├── tsconfig.json        # TypeScript 設定
└── vite.config.ts       # Vite 設定
```
