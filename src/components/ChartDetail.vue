<template>
  <div class="detail-view">
    <div class="detail-header">
      <div class="title-section">
        <h2>{{ symbol }}</h2>
        <!-- <span class="price-change">{{ priceChange }}</span> -->
      </div>
      <button class="close-button" @click="onClose">
        <span>×</span>
      </button>
    </div>
    <div class="chart-container w-full h-full">
      <div ref="chartContainer" class="chart-placeholder w-full" ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, onUnmounted, onMounted } from 'vue'
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType, Time } from 'lightweight-charts'

const props = defineProps<{
  symbol: string
  data: CandlestickData
  onClose: () => void
}>()


const chartContainer = ref<HTMLElement | null>(null)
const chart = ref<IChartApi  | null>(null)
const candlestickSeries = ref<ISeriesApi<'Candlestick'> | null>(null)
let resizeObserver: ResizeObserver | null = null

const initChart = () => {
  if (!chartContainer.value) return;

  // 建立圖表
  chart.value = createChart(chartContainer.value, {
    layout: {
      background: { type: ColorType.Solid, color: '#253248' },
      textColor: '#D9D9D9',
    },
    grid: {
      vertLines: { color: '#334158' },
      horzLines: { color: '#334158' },
    },
    width: chartContainer.value.clientWidth,
    height: 400,
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
  });

  // 檢查是否能正常使用 addCandlestickSeries
  if (chart.value && typeof chart.value.addCandlestickSeries === 'function') {
    candlestickSeries.value = chart.value.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
  } else {
    console.error('圖表建立失敗或無法調用 addCandlestickSeries');
  }
}


// 更新圖表資料
const updateChartData = () => {
  if (!candlestickSeries.value || !props.data || props.data.length === 0) {
    console.error('缺少數據');
    return;
  }

  // format 資料
  const formattedData = props.data.map(item => ({
    time: Math.floor(item.time / 1000), // 轉換為秒
    open: Number(item.open),
    high: Number(item.high),
    low: Number(item.low),
    close: Number(item.close),
  }));

  // 更新資料
  candlestickSeries.value.setData(formattedData);

  // 確保資料
  if (chart.value) {
    chart.value.timeScale().fitContent();
  }
};

// 監聽資料變化
watch(() => props.data, (newData) => {
  if (newData && newData.length > 0) {
    updateChartData()
  }
}, { deep: true, immediate: true })

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.remove();
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
})
</script>

<style scoped>
.detail-view {
  flex: 1;
  min-width: 800px; /* 增加最小寬度 */
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 24px);
  position: sticky;
  top: 12px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-container {
  height: calc(100% - 60px);
  background: #f5f5f5;
  border-radius: 4px;
  position: relative;
  width: 100%;
}


.chart-placeholder {
  height: 100%;
  min-width: 760px; /* 確保圖表容器有足夠的最小寬度 */
}

.close-button {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.close-button span {
  line-height: 1;
  padding-bottom: 2px;
}



@media (max-width: 1600px) {
  .detail-view {
    min-width: 700px;
  }

  .chart-placeholder {
    min-width: 660px;
  }
}

@media (max-width: 1200px) {
  .detail-view {
    max-width: 100%;
    min-width: 100%;
    height: 500px;
    position: static;
  }
  .chart-placeholder {
    min-width: 100%;
  }
}
</style>
