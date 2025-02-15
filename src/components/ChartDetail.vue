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
      <div class="chart-placeholder">K線圖區域
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  symbol: string
  priceChange: string
  onClose: () => void
}>()
</script>

<style scoped>
.detail-view {
  flex: 1;
  max-width: calc(100vw - 900px - 24px - 40px);
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
    max-width: calc(100vw - 700px - 24px - 40px);
  }
}

@media (max-width: 1200px) {
  .detail-view {
    max-width: 100%;
    height: 500px;
    position: static;
  }
}
</style>