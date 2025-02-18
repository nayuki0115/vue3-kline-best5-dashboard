<template>
  <div class="detail-view">
    <div class="detail-header">
      <div class="title-section">
        <h2>{{ symbol }}</h2>
        <span class="price-change">{{ priceChange }}</span>
      </div>
      <button class="close-button" @click="onClose">
        <span>×</span>
      </button>
    </div>
    <div class="chart-container">
      <!-- <div class="chart-placeholder">K線圖區域
        {{ data }}
      </div> -->
      <div ref="chartContainer" class="chart-placeholder"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch, onUnmounted, onMounted   } from 'vue'
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType, Time } from 'lightweight-charts'

const props = defineProps<{
  symbol: string
  priceChange: string
  data: CandlestickData
  onClose: () => void
}>()

interface ChartWithCandlesticks extends IChartApi {
  addCandlestickSeries: (options?: CandlestickSeriesOptions) => ISeriesApi<'Candlestick'>;
}

interface CandlestickSeriesOptions {
  upColor?: string;
  downColor?: string;
  borderVisible?: boolean;
  wickUpColor?: string;
  wickDownColor?: string;
}

const chartContainer = ref<HTMLElement | null>(null)
const chart = ref<ChartWithCandlesticks | null>(null)
const candlestickSeries = ref<ISeriesApi<'Candlestick'> | null>(null)
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (chartContainer.value) {
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
    }) as ChartWithCandlesticks


    candlestickSeries.value = chart.value?.addCandlestickSeries?.({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });


    updateChartData();


    resizeObserver = new ResizeObserver(entries => {
      if (chart.value && entries[0].contentRect) {
        chart.value.applyOptions({ 
          width: entries[0].contentRect.width 
        });
      }
    })

    resizeObserver.observe(chartContainer.value);
  }
});

watch(() => props.data, () => {
  updateChartData()
}, { deep: true })

const updateChartData = () => {
  if (candlestickSeries.value && props.data.length > 0) {
    candlestickSeries.value.setData(props.data.map(item => ({
      time: item.time / 1000 as Time, // 加入 Time 型別
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close
    })))
  }
}

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
  min-width: 400px; /* Add minimum width */
  max-width: calc(100vw - 600px); /* Simplified calculation */
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 2 * var(--container-padding));
  position: sticky;
  top: var(--container-padding);
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
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
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
    max-width: calc(100vw - 500px);
  }
}

@media (max-width: 1200px) {
  .detail-view {
    max-width: 100%;
    min-width: 100%;
    height: 500px;
    position: static;
  }
}
</style>