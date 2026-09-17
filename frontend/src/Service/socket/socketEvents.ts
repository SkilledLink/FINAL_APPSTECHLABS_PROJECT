export const SocketEvents = {
  // client → server
  SEND_MESSAGE: 'send_message',
  MESSAGE_READ: 'message_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  PRESENCE_QUERY: 'presence_query',

  // server → client
  NEW_MESSAGE: 'new_message',
  NEW_NOTIFICATION: 'new_notification',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];