// src/Service/socket/socketEvents.ts

export const SocketEvents = {
  // ── client → server ──────────────────────────────────────
  SEND_MESSAGE: 'send_message',
  MESSAGE_READ: 'message_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  PRESENCE_QUERY: 'presence_query',
  CONVERSATION_JOIN: 'conversation_join',

  // ── server → client ──────────────────────────────────────
  NEW_MESSAGE: 'new_message',
  NEW_NOTIFICATION: 'new_notification',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',

  // ── Conversation requests ────────────────────────────────
  CONVERSATION_REQUEST_RECEIVED: 'conversation_request_received',
  CONVERSATION_REQUEST_ACCEPTED: 'conversation_request_accepted',
  CONVERSATION_REQUEST_REJECTED: 'conversation_request_rejected',

  // ── Calling: client → server ────────────────────────────
  CALL_INITIATE: 'call_initiate',
  CALL_ACCEPT: 'call_accept',
  CALL_REJECT: 'call_reject',
  CALL_END: 'call_end',

  // ── Calling: server → client ────────────────────────────
  CALL_INCOMING: 'call_incoming',
  CALL_OUTGOING: 'call_outgoing',
  CALL_ACCEPTED: 'call_accepted',
  CALL_REJECTED: 'call_rejected',
  CALL_ENDED: 'call_ended',
  CALL_MISSED: 'call_missed',

  // ── WebRTC signaling: bidirectional relay ───────────────
  WEBRTC_OFFER: 'webrtc_offer',
  WEBRTC_ANSWER: 'webrtc_answer',
  WEBRTC_ICE: 'webrtc_ice_candidate',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];