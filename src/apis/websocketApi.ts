export const websocketApi = {
  // 建立訂閱消息
  createSubscribeMessage: (channels: string[]) => ({
    id: Date.now(),
    method: 'subscribe',
    params: { channels }
  }),

  // 建立取消訂閱消息
  createUnsubscribeMessage: (channels: string[]) => ({
    id: Date.now(),
    method: 'unsubscribe',
    params: { channels }
  }),

  // 建立心跳消息
  createHeartbeatMessage: () => ({
    id: Date.now(),
    method: 'public/heartbeat'
  }),

  // 建立心跳響應消息
  createHeartbeatResponse: (id: number) => ({
    id,
    method: 'public/respond-heartbeat'
  }),

  // 解析 WebSocket 消息
  parseMessage: (data: string): WebSocketResponse => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      return { method: 'error', message: 'Invalid message format' };
    }
  }
};