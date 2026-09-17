export interface AckSuccess<T> { success: true; data: T; }
export interface AckFailure { success: false; error: { code: string; message: string }; }
export type Ack<T> = AckSuccess<T> | AckFailure;