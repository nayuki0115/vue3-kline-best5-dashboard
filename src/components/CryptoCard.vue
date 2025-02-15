<template>
  <div 
    class="crypto-card" 
    :class="{ 'active': isActive }"
    @click="$emit('cardClick')"
  >
    <div class="card-header">
      <h3>BTC/USDT</h3>
      <span class="price-change">+2.34%</span>
    </div>
    <div class="card-content">
      <table>
        <thead>
          <tr>
            <th>訂單</th>
            <th>數量</th>
            <th>價格</th>
            <th>累計</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" 
              :key="item.id"
              :class="{ 'sell-row': item.type === 'sell', 'buy-row': item.type === 'buy' }"
          >
            <td>{{ item.id }}</td>
            <td>{{ item.amount.toFixed(4) }}</td>
            <td>{{ item.price.toFixed(2) }}</td>
            <td>{{ item.total.toFixed(4) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  data: CryptoData[];
  isActive: boolean;
}>()

defineEmits<{
  (e: 'cardClick'): void;
}>()
</script>

<style scoped>
.crypto-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.price-change {
  color: #4CAF50;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th, td {
  padding: 6px;
  text-align: right;
}

th:first-child, td:first-child {
  text-align: left;
}

.sell-row {
  background-color: rgba(255, 0, 0, 0.1);
}

.buy-row {
  background-color: rgba(0, 255, 0, 0.1);
}

.active {
  border: 2px solid #1976D2;
}
</style>