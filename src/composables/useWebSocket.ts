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
  const isInitialDataReceived = ref<Record<string, boolean>>({})
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
          // console.log('Received message:', parsedMessage)  // 查看接收到的原始資料
          
          if (parsedMessage.method === 'public/heartbeat') {
            handleHeartbeat(parsedMessage.id)
            return
          }
          
          // 處理 orderbook 資料
          if (parsedMessage.result?.data) {
            const { instrument_name, data } = parsedMessage.result
            const channel = parsedMessage.result.channel || ''

            
            
            // 更新orderbook 資料
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

            // 處理 K 線資料
            if (channel.startsWith('candlestick')) {
              
              // 初始資料載入
              if (Array.isArray(data) && !isInitialDataReceived.value[instrument_name]) {
                const klineData = data.map(formatKlineData)
                candlesticks.value[instrument_name] = klineData
                isInitialDataReceived.value[instrument_name] = true
              } else if (!Array.isArray(data)) {
              // 處理即時更新
                updateCandlestick(instrument_name, formatKlineData(data))
              }
            }
            

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


  // 處理斷開連結
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

  // 訂閱 K 線資料
  const subscribeCandlestick = (instrument_name: string, timeFrame: string = '1m') => {
    const channel = `candlestick.${timeFrame}.${instrument_name}`
    subscribe([channel])
  }

  // 取消訂閱 K 線資料
  const unsubscribeCandlestick = (instrument_name: string, timeFrame: string = '1m') => {
    const channel = `candlestick.${timeFrame}.${instrument_name}`
    unsubscribe([channel])
  }

  // 使用 computed 來建立響應式的 getter
  const getOrderBook = computed(() => {
    return (symbol: string): OrderBook => {
      return orderBooks.value[symbol] || { bids: [], asks: [] }
    }
  })

  // 使用 computed 獲取特定交易對的 K 線資料
  const getCandlestickData = computed(() => {
    return (symbol: string): CandlestickData[] => {
      return candlesticks.value[symbol] || []
    }
  })

  // K線資料 format
  const formatKlineData = (item: KlineData): CandlestickData => ({
    time: item.t,
    open: parseFloat(item.o),
    high: parseFloat(item.h),
    low: parseFloat(item.l),
    close: parseFloat(item.c),
    volume: parseFloat(item.v)
  })

  const updateCandlestick = (symbol: string, newData: CandlestickData) => {
    if (!candlesticks.value[symbol]) {
      candlesticks.value[symbol] = []
    }
    
    const currentData = [...candlesticks.value[symbol]]
    const lastIndex = currentData.length - 1
    
    if (lastIndex >= 0 && currentData[lastIndex].time === newData.time) {
      currentData[lastIndex] = newData
    } else {
      currentData.push(newData)
    }
    
    candlesticks.value = {
      ...candlesticks.value,
      [symbol]: currentData
    }
  }

  // 關閉連結
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