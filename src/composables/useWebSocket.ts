// src/composables/useWebSocket.ts
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { websocketApi } from '@/apis/websocketApi'

export function useWebSocket(url: string = 'wss://stream.crypto.com/exchange/v1/market') {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const lastMessage = ref<any>(null)
  const reconnectAttempts = ref(0)
  const MAX_RECONNECT_ATTEMPTS = 5
  const HEARTBEAT_INTERVAL = 30000
  let heartbeatTimer: NodeJS.Timeout | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  const orderBooks = ref<Record<string, OrderBook>>({})

  // 建立連結
  const connect = () => {
    try {
      ws.value = new WebSocket(url)
      
      ws.value.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        reconnectAttempts.value = 0
        startHeartbeat()
      }

      ws.value.onmessage = (event) => {
        try {
          const parsedMessage = JSON.parse(event.data)
          // console.log('Received message:', parsedMessage)  // 查看接收到的原始數據
          
          if (parsedMessage.method === 'public/heartbeat') {
            handleHeartbeat(parsedMessage.id)
            return
          }
          
          // 添加更多的數據驗證
          if (parsedMessage.result?.data) {
            const { instrument_name, data } = parsedMessage.result
            // 更新訂單簿數據
            orderBooks.value = {
              ...orderBooks.value,
              [instrument_name]: {
                // bids: data[0].bids,
                // asks: data[0].asks
                bids: data[0].bids.slice(0, 5).map(([price, quantity, orders]) => ({
                  price: parseFloat(price),
                  quantity: parseFloat(quantity),
                  orders,
                  accumulatedy: parseFloat(quantity)
                })),
                asks: data[0].asks.slice(0, 5).map(([price, quantity, orders]) => ({
                  price: parseFloat(price),
                  quantity: parseFloat(quantity),
                  orders,
                  accumulatedy: parseFloat(quantity)
                }))
              }
            }
            
            // console.log(`Updated orderbook for ${instrument_name}:`, orderBooks.value[instrument_name])
          }
          
          lastMessage.value = parsedMessage
        } catch (error) {
          console.error('Error processing message:', error, 'Raw message:', event.data)
        }
      }

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        handleDisconnect()
      }

      ws.value.onclose = () => {
        console.log('WebSocket closed')
        handleDisconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      handleDisconnect()
    }
  }

  // 使用 computed 來建立響應式的 getter
  const getOrderBook = computed(() => {
    console.log('orderBooks.value', orderBooks.value)
    return (symbol: string): OrderBook => {
      return orderBooks.value[symbol] || { bids: [], asks: [] }
    }
  })

  // 處理斷開連接
  const handleDisconnect = () => {
    isConnected.value = false
    stopHeartbeat()
    
    if (reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS) {
      reconnectTimer = setTimeout(() => {
        reconnectAttempts.value++
        connect()
      }, 5000 * Math.pow(2, reconnectAttempts.value)) // 指数退避重连
    }
  }

  // 開始心跳檢測
  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      if (isConnected.value && ws.value?.readyState === WebSocket.OPEN) {
        const heartbeatMsg = websocketApi.createHeartbeatMessage()
        ws.value.send(JSON.stringify(heartbeatMsg))
      }
    }, HEARTBEAT_INTERVAL)
  }

  // 停止心跳檢測
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  // 處理心跳響應
  const handleHeartbeat = (id: number) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      const response = websocketApi.createHeartbeatResponse(id)
      ws.value.send(JSON.stringify(response))
    }
  }

  // 訂閱頻道
  const subscribe = (channels: string[]) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      const subscribeMsg = websocketApi.createSubscribeMessage(channels)
      ws.value.send(JSON.stringify(subscribeMsg))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  // 關閉連接
  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
    }
    stopHeartbeat()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  // 生命週期
  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    lastMessage,
    orderBooks,
    getOrderBook: getOrderBook.value,  // 返回計算屬性的值
    subscribe,
    disconnect,
    connect
  }
}

interface WebSocketResponse {
  id?: number
  method: string
  code?: number
  message?: string
  result?: any
}