export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      booking_slots: {
        Row: {
          date: string
          end_time: string
          id: string
          is_available: boolean | null
          meeting_room_id: string | null
          start_time: string
        }
        Insert: {
          date: string
          end_time: string
          id?: string
          is_available?: boolean | null
          meeting_room_id?: string | null
          start_time: string
        }
        Update: {
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          meeting_room_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_slots_meeting_room_id_fkey"
            columns: ["meeting_room_id"]
            isOneToOne: false
            referencedRelation: "meeting_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_slot_id: string | null
          created_at: string | null
          id: string
          member_id: string | null
          purpose: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
        }
        Insert: {
          booking_slot_id?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
        }
        Update: {
          booking_slot_id?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_booking_slot_id_fkey"
            columns: ["booking_slot_id"]
            isOneToOne: false
            referencedRelation: "booking_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_rooms: {
        Row: {
          capacity: number | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
        }
        Insert: {
          capacity?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
        }
        Update: {
          capacity?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
        }
        Relationships: []
      }
      member_services: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          member_id: string | null
          one_time_purchased: boolean | null
          recurring_purchased: boolean | null
          service_id: string | null
          stripe_price_id: string | null
          tier_at_purchase: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          member_id?: string | null
          one_time_purchased?: boolean | null
          recurring_purchased?: boolean | null
          service_id?: string | null
          stripe_price_id?: string | null
          tier_at_purchase: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          member_id?: string | null
          one_time_purchased?: boolean | null
          recurring_purchased?: boolean | null
          service_id?: string | null
          stripe_price_id?: string | null
          tier_at_purchase?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_services_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          company_name: string
          contact_name: string | null
          created_at: string | null
          email: string
          id: string
          phone: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          contact_name?: string | null
          created_at?: string | null
          email: string
          id?: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          member_id: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          member_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          member_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_payment_intent_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pricing: {
        Row: {
          id: string
          is_included: boolean | null
          one_time_price: number | null
          recurring_interval: string | null
          recurring_price: number | null
          service_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          id?: string
          is_included?: boolean | null
          one_time_price?: number | null
          recurring_interval?: string | null
          recurring_price?: number | null
          service_id?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          id?: string
          is_included?: boolean | null
          one_time_price?: number | null
          recurring_interval?: string | null
          recurring_price?: number | null
          service_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "service_pricing_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string | null
          visibility: Database["public"]["Enums"]["service_visibility"]
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["service_visibility"]
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["service_visibility"]
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          member_id: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          member_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id?: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          member_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_builds: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          domain: string | null
          due_date: string | null
          id: string
          member_id: string | null
          requirements: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          domain?: string | null
          due_date?: string | null
          id?: string
          member_id?: string | null
          requirements?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          domain?: string | null
          due_date?: string | null
          id?: string
          member_id?: string | null
          requirements?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_builds_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_member_subscription: {
        Args: {
          _member_id: string
          _tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Returns: Database["public"]["Tables"]["subscriptions"]["Row"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      order_status:
        | "pending"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
      service_type: "one_time" | "recurring" | "both"
      service_visibility: "pricing_page" | "portal_only" | "both"
      subscription_status: "active" | "cancelled" | "past_due" | "paused"
      subscription_tier: "basic" | "essential" | "professional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      order_status: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "refunded",
      ],
      service_type: ["one_time", "recurring", "both"],
      service_visibility: ["pricing_page", "portal_only", "both"],
      subscription_status: ["active", "cancelled", "past_due", "paused"],
      subscription_tier: ["basic", "essential", "professional"],
    },
  },
} as const
