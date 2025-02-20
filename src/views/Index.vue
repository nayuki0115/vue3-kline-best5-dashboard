<template>
  <div class="main-container">
    <div class="content-wrapper">
      <!-- 左側卡片區域 -->
      <div class="cards-section">
        <div class="cards-grid">
          <template v-for="title in cardTitles" :key="title">
            <CryptoCard
              v-if="cardDatas[title]?.length"
              :title="title"
              :data="cardDatas[title]"
              :isActive="selectedCardId === cardTitles.indexOf(title)"
              @card-click="handleCardClick(cardTitles.indexOf(title), title)"
            />
          </template>
        </div>
      </div>

      <!-- 右側 K 線圖區域 -->
      <Transition name="fade">
        <ChartDetail
          v-if="selectedCardId !== null"
          :symbol="selectedCardName"
          :data="candlestickData"
          @close="closeDetail"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'

import CryptoCard from '@/components/CryptoCard.vue'
import ChartDetail from '@/components/ChartDetail.vue'
import { useWebSocket } from '@/composables/useWebSocket'

const { isConnected, subscribe, orderBooks, getCandlestickData, subscribeCandlestick, unsubscribeCandlestick } = useWebSocket()
import { useDebounce } from "@/composables/useDebounce"

// 監聽連結消息
// watch(isConnected, (connected) => {
//   if (connected) {
//     // 連結成功後，訂閱所需的頻道
//     subscribe(['book.BTC_USDT.10', 'book.ETH_USDT.10', 'book.BNB_USDT.10', 'book.XRP_USDT.10', 'book.DOGE_USDT.10'])
//   }
// })

const symbols = [
  'BTCUSD-PERP.10',
  'ETHUSD-PERP.10',
  'XRP_USDT.10',
  'SOL_USDT.10',
  'DOGE_USDT.10',
  'ADA_USDT.10',
]

const cardTitles = [
  'BTCUSD-PERP',
  'ETHUSD-PERP',
  'XRP_USDT',
  'SOL_USDT',
  'DOGE_USDT',
  'ADA_USDT',
]

watch(isConnected, (connected) => {
  if (connected) {
    const channels = symbols.map(symbol => `book.${symbol}`)
    subscribe(channels)
  }
})

const cardDatas = reactive({})

watch(orderBooks, (newValue) => {
  for (let key in newValue) {
    let obj = newValue[key];
    if (obj) {
      let asks = obj.asks.slice(0, 5).map((item) => ({
        id: item.orders,
        amount: item.quantity,
        price: item.price,
        total: item.quantity,
        type: 'sell',
      }));

      let bids = obj.bids.slice(0, 5).map((item) => ({
        id: item.orders,
        amount: item.quantity,
        price: item.price,
        total: item.quantity,
        type: 'buy',
      }));

      useDebounce(() => cardDatas[key] = [...asks, ...bids], 500)
    }
  }

  
}, { deep: true })


const selectedCardId = ref<number | null>(null)
const selectedCardName = ref<string>('')
const timeFrame = ref('1m')

const handleCardClick = (index: number, title: string) => {
  // 如果點擊的是當前已選中的卡片，則關閉視窗
  if (selectedCardId.value === index) {
    unsubscribeCandlestick(selectedCardName.value, timeFrame.value)
    selectedCardId.value = null
    selectedCardName.value = ''
  } else {
    // 否則，開啟新點擊的卡片對應的視窗
    selectedCardId.value = index
    selectedCardName.value = title
    subscribeCandlestick(selectedCardName.value, timeFrame.value)
  }
}
const closeDetail = () => {
  unsubscribeCandlestick(selectedCardName.value, timeFrame.value)
  selectedCardId.value = null
  selectedCardName.value = ''
}

const candlestickData = computed(() => 
  getCandlestickData(selectedCardName.value)
)
</script>

<style>
:root {
  --container-padding: 20px;
  --card-gap: 16px;
}

.main-container {
  min-height: 100vh;
  padding: var(--container-padding);
}

.content-wrapper {
  display: flex;
  gap: 24px;
  width: 100%;
}

.cards-section {
  flex: 0 0 auto;
  width: 900px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--card-gap);
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease !important;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0 !important;
}

/* RWD 設定 */
@media (max-width: 1600px) {
  .cards-section {
    width: 700px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
    margin-left: 0;
  }
  
  .cards-section {
    width: 100%;
  }
  
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .main-container {
    padding: 10px;
  }
}

/* 基礎重置樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f0f2f5;
  color: #333;
}
</style>
