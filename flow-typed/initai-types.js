/* @flow */

/* API client */
declare type APIClientConfig = {
  token: string
}

declare interface APIClientInterface {
  baseUrl: string,
  fetchMessages(userId: string): Promise<FetchMessagesResult>,
  fetchSuggestions(userId: string): Promise<SuggestionsResult>,
  getAuthHeaders(): { [authorization: string]: string },
  getBaseUrl(): string,
  sendMessage(MessageConfig): Promise<SendMessageResult>,
  token: string,
  triggerInboundEvent(InboundEvent): Promise<TriggerEventResult>
}

/* Message types */
declare type MessageContentType = 'text' | 'image' | 'postback-action'
declare type SenderRole = 'agent' | 'app' | 'end-user'

declare type TextMessage = {
  content: string,
  contentType: 'text',
  senderRole: SenderRole, // default 'end-user'
  userId: string,
}

declare type ImageMessage = {
  content: {
    alternativeText?: string,
    imageUrl: string,
    mimeType: 'image/png' | string
  },
  contentType: 'image',
  senderRole: SenderRole, // default 'end-user'
  userId: string,
}

declare type PostbackMessage = {
  content: {
    text: string,
    data?: Object | string, // JSON serializeable Object
    stream: string,
  },
  contentType: 'postback-action',
  senderRole: SenderRole, // default 'end-user'
  userId: string,
}

declare type MessageConfig = TextMessage | ImageMessage | PostbackMessage

declare type MessageDirection = 'in' | 'out'

declare type InboundEvent = {
  userId: string,
  eventType: string,
  data?: Object,
}

/**
 * The keys in a result are snake_case since they are a direct response
 * from the API
 */
declare type SendMessageResult = {
  id: string,
  direction: MessageDirection,
  sender_type: 'human',
  sender_role: SenderRole,
  content_type: MessageContentType,
  content: string,
  source_type: 'ip',
  created_at: string,
  updated_at: string
}

declare type TriggerEventResult = {
  body: string,
  error: null
}

declare type GenericAPIError = {
  message: string,
  status?: number,
  statusText?: string,
}

/* Monitor client */
declare type MonitorConfig = {
  apiClient: APIClientInterface,
  userId: string
}

/**
 * A message fetched from a conversation list
 */
declare type ConversationMessage = {
  id: string,
  direction: MessageDirection,
  content: string,
  content_type: MessageContentType,
  created_at: string,
  updated_at: string,
  text: string,
  sender_role: SenderRole
}

declare type FetchMessagesResult = {
  messages: ConversationMessage[],
  pagination: {
    current_page_url: string,
    first_page_url: string,
    next_page_before_id?: string,
    next_page_url: string,
    page_size: number,
    remaining_page_count?: number,
  }
}

declare type Suggestion = {
  content: {text: string},
  content_type: 'text',
  metadata?: Object,
  nlp_metadata?: Object,
  suggestion_type: 'message',
  suggestion_id: string,
  data?: Object
}

declare type SuggestionsResult = {
  conversation_id: string,
  suggestions: Suggestion[]
}

/* Pusher types */
// TODO: Add to flow-typed repo
// via: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/pusher-js/index.d.ts
declare type PusherChannel = {
  bind(eventName: string, callback: Function, context?: any): void,
  unbind(): void
}

declare type PusherClient = {
  subscribe(name: string): PusherChannel,
  disconnect(): void
}
