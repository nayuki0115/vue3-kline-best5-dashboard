<template>
  <div class="main-container">
    <div class="content-wrapper">
      <!-- 左側卡片區域 -->
      <div class="cards-section">
        <div class="cards-grid">
          <CryptoCard
            v-for="(card, index) in cards"
            :key="index"
            :data="cardData"
            :isActive="selectedCard === index"
            @card-click="handleCardClick(index)"
          />
        </div>
      </div>

      <!-- 右側 K 線圖區域 -->
      <Transition name="fade">
        <ChartDetail
          v-if="selectedCard !== null"
          symbol="BTC/USDT"
          price-change="+2.34%"
          @close="closeDetail"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import CryptoCard from '@/components/CryptoCard.vue'
import ChartDetail from '@/components/ChartDetail.vue'
import { useWebSocket } from '@/composables/useWebSocket'

const { isConnected, lastMessage, subscribe, orderBooks } = useWebSocket()

// 監聽連結消息
// watch(isConnected, (connected) => {
//   if (connected) {
//     // 連結成功後，訂閱所需的頻道
//     subscribe(['book.BTC_USDT.10', 'book.ETH_USDT.10', 'book.BNB_USDT.10', 'book.XRP_USDT.10', 'book.DOGE_USDT.10'])
//   }
// })

const symbols = [
  'BTC_USDT.10',
  'ETH_USDT.10',
  'XRP_USDT.10',
  'SOL_USDT.10',
  'DOGE_USDT.10',
  'ADA_USDT.10',
]

watch(isConnected, (connected) => {
  if (connected) {
    // console.log('WebSocket connected, preparing to subscribe...')
    const channels = symbols.map(symbol => `book.${symbol}`)
    // console.log('Subscribing to channels:', channels)
    subscribe(channels)
  }
})

// 監聽消息
// watch(lastMessage, (message) => {
//   if (message && message.result) {
//     // console.log('Received message:', message)
//     // console.log('Received result:', message.result)
//     // console.log('orderBooks', orderBooks)
//   }
// })

watch(orderBooks, (newValue) => {
  // console.log('OrderBooks updated:', newValue)
}, { deep: true })



const cardData: CryptoData[] = [
  { id: 8, amount: 2.5000, price: 45700.00, total: 2.5000, type: 'sell' },
  { id: 5, amount: 1.8000, price: 45690.00, total: 4.3000, type: 'sell' },
  { id: 12, amount: 3.2000, price: 45685.00, total: 7.5000, type: 'sell' },
  { id: 4, amount: 1.5000, price: 45682.50, total: 9.0000, type: 'sell' },
  { id: 7, amount: 2.1000, price: 45680.00, total: 11.1000, type: 'sell' },
  { id: 9, amount: 2.8000, price: 45675.00, total: 2.8000, type: 'buy' },
  { id: 6, amount: 1.9000, price: 45670.00, total: 4.7000, type: 'buy' },
  { id: 8, amount: 2.4000, price: 45665.00, total: 7.1000, type: 'buy' },
  { id: 5, amount: 1.6000, price: 45660.00, total: 8.7000, type: 'buy' },
  { id: 7, amount: 2.2000, price: 45655.00, total: 10.9000, type: 'buy' },
]

// const cards = ref(Array(6).fill(cardData))
const cards = ref()
const selectedCard = ref<number | null>(null)

const handleCardClick = (index: number) => {
  // 如果點擊的是當前已選中的卡片，則關閉視窗
  if (selectedCard.value === index) {
    selectedCard.value = null;
  } else {
    // 否則，開啟新點擊的卡片對應的視窗
    selectedCard.value = index;
  }
}

const closeDetail = () => {
  selectedCard.value = null;
}
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
  max-width: 1800px;
  margin: 0 auto;
  width: 100%; /* 確保內容寬度不會超出容器 */
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