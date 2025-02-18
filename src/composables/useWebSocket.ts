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
  const candlesticks = ref<Record<string, CandlestickData[]>>({})
  const activeSubscriptions = ref<Set<string>>(new Set())

  // 建立連結
  const connect = () => {
    try {
      ws.value = new WebSocket(url)
      
      ws.value.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        reconnectAttempts.value = 0
        startHeartbeat()
        resubscribeChannels() // 重新訂閱之前的頻道
      }

      ws.value.onmessage = (event) => {
        try {
          const parsedMessage = JSON.parse(event.data)
          // console.log('Received message:', parsedMessage)  // 查看接收到的原始數據
          
          if (parsedMessage.method === 'public/heartbeat') {
            handleHeartbeat(parsedMessage.id)
            return
          }
          
          // 處理訂單簿數據
          if (parsedMessage.result?.data) {
            const { instrument_name, data } = parsedMessage.result
            const channel = parsedMessage.result.channel || ''


            
            // 更新訂單簿數據
            if (channel.startsWith('book')) {
              orderBooks.value = {
                ...orderBooks.value,
                [instrument_name]: {
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
            }

            // 處理 K 線數據
            if (channel.startsWith('candlestick')) {
              const klineData = data.map((item: any) => ({
                time: item.t,
                open: parseFloat(item.o),
                high: parseFloat(item.h),
                low: parseFloat(item.l),
                close: parseFloat(item.c),
                volume: parseFloat(item.v)
              }))

              // 更新或添加新的 K 線數據
              candlesticks.value = {
                ...candlesticks.value,
                [instrument_name]: klineData
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

  // 重新訂閱所有活動頻道
  const resubscribeChannels = () => {
    if (activeSubscriptions.value.size > 0) {
      const channels = Array.from(activeSubscriptions.value)
      subscribe(channels)
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

  // 取消訂閱頻道
  const unsubscribe = (channels: string[]) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      channels.forEach(channel => {
        activeSubscriptions.value.delete(channel)
      })
      
      const unsubscribeMsg = websocketApi.createUnsubscribeMessage(channels)
      ws.value.send(JSON.stringify(unsubscribeMsg))
    }
  }

  // 訂閱 K 線數據
  const subscribeCandlestick = (instrumentName: string, timeFrame: string = '1m') => {
    const channel = `candlestick.${timeFrame}.${instrumentName}`
    console.log('channel', channel)
    subscribe([channel])
  }

  // 取消訂閱 K 線數據
  const unsubscribeCandlestick = (instrumentName: string, timeFrame: string = '1m') => {
    const channel = `candlestick.${timeFrame}.${instrumentName}`
    console.log('cancel K channel', channel)
    unsubscribe([channel])
  }

  // 使用 computed 來建立響應式的 getter
  const getOrderBook = computed(() => {
    console.log('orderBooks.value', orderBooks.value)
    return (symbol: string): OrderBook => {
      return orderBooks.value[symbol] || { bids: [], asks: [] }
    }
  })

  // 使用 computed 獲取特定交易對的 K 線數據
  const getCandlestickData = computed(() => {
    console.log('candlesticks', candlesticks.value)
    return (symbol: string): CandlestickData[] => {
      return candlesticks.value[symbol] || []
    }
  })

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
    candlesticks,
    getOrderBook: getOrderBook.value,
    getCandlestickData: getCandlestickData.value,
    subscribe,
    unsubscribe,
    subscribeCandlestick,
    unsubscribeCandlestick,
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