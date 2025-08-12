export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar: string | null
          aura: number
          is_online: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          avatar?: string | null
          aura?: number
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar?: string | null
          aura?: number
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bubbles: {
        Row: {
          id: string
          user_id: string
          message: string
          x: number
          y: number
          vx: number
          vy: number
          reactions: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          x: number
          y: number
          vx?: number
          vy?: number
          reactions?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          x?: number
          y?: number
          vx?: number
          vy?: number
          reactions?: number
          created_at?: string
        }
      }
      direct_messages: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}