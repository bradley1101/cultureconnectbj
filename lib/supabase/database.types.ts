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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          avatar_path: string | null
          banner_path: string | null
          bio: string | null
          city: string | null
          created_at: string
          disciplines: string[]
          featured_until: string | null
          id: string
          is_verified: boolean
          slug: string
          social_links: Json
          stage_name: string
        }
        Insert: {
          avatar_path?: string | null
          banner_path?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          disciplines?: string[]
          featured_until?: string | null
          id: string
          is_verified?: boolean
          slug: string
          social_links?: Json
          stage_name: string
        }
        Update: {
          avatar_path?: string | null
          banner_path?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          disciplines?: string[]
          featured_until?: string | null
          id?: string
          is_verified?: boolean
          slug?: string
          social_links?: Json
          stage_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "artists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          artist_id: string
          category: string
          created_at: string
          description: string | null
          dimensions: string | null
          featured_until: string | null
          id: string
          image_paths: string[]
          kind: Database["public"]["Enums"]["artwork_kind"]
          price_fcfa: number
          slug: string
          status: Database["public"]["Enums"]["review_status"]
          stock: number
          technique: string | null
          title: string
          year: number | null
        }
        Insert: {
          artist_id: string
          category: string
          created_at?: string
          description?: string | null
          dimensions?: string | null
          featured_until?: string | null
          id?: string
          image_paths?: string[]
          kind: Database["public"]["Enums"]["artwork_kind"]
          price_fcfa: number
          slug: string
          status?: Database["public"]["Enums"]["review_status"]
          stock?: number
          technique?: string | null
          title: string
          year?: number | null
        }
        Update: {
          artist_id?: string
          category?: string
          created_at?: string
          description?: string | null
          dimensions?: string | null
          featured_until?: string | null
          id?: string
          image_paths?: string[]
          kind?: Database["public"]["Enums"]["artwork_kind"]
          price_fcfa?: number
          slug?: string
          status?: Database["public"]["Enums"]["review_status"]
          stock?: number
          technique?: string | null
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          artist_id: string | null
          city: string
          cover_path: string | null
          created_at: string
          description: string | null
          featured_until: string | null
          id: string
          link: string | null
          starts_at: string
          status: Database["public"]["Enums"]["review_status"]
          submitted_by: string | null
          title: string
          venue: string | null
        }
        Insert: {
          artist_id?: string | null
          city: string
          cover_path?: string | null
          created_at?: string
          description?: string | null
          featured_until?: string | null
          id?: string
          link?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["review_status"]
          submitted_by?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          artist_id?: string | null
          city?: string
          cover_path?: string | null
          created_at?: string
          description?: string | null
          featured_until?: string | null
          id?: string
          link?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["review_status"]
          submitted_by?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          contact: string | null
          created_at: string
          deadline: string
          description: string | null
          featured_until: string | null
          id: string
          link: string | null
          organizer: string
          status: Database["public"]["Enums"]["review_status"]
          submitted_by: string | null
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
        }
        Insert: {
          contact?: string | null
          created_at?: string
          deadline: string
          description?: string | null
          featured_until?: string | null
          id?: string
          link?: string | null
          organizer: string
          status?: Database["public"]["Enums"]["review_status"]
          submitted_by?: string | null
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
        }
        Update: {
          contact?: string | null
          created_at?: string
          deadline?: string
          description?: string | null
          featured_until?: string | null
          id?: string
          link?: string | null
          organizer?: string
          status?: Database["public"]["Enums"]["review_status"]
          submitted_by?: string | null
          title?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string | null
          artist_id: string
          artist_net_fcfa: number
          artwork_id: string
          buyer_name: string | null
          buyer_phone: string | null
          commission_fcfa: number
          commission_rate: number
          created_at: string
          id: string
          price_fcfa: number
          reference: string
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          artist_id: string
          artist_net_fcfa: number
          artwork_id: string
          buyer_name?: string | null
          buyer_phone?: string | null
          commission_fcfa: number
          commission_rate: number
          created_at?: string
          id?: string
          price_fcfa: number
          reference?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          artist_id?: string
          artist_net_fcfa?: number
          artwork_id?: string
          buyer_name?: string | null
          buyer_phone?: string | null
          commission_fcfa?: number
          commission_rate?: number
          created_at?: string
          id?: string
          price_fcfa?: number
          reference?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          image_path: string | null
          media_url: string | null
          position: number
          title: string | null
          year: number | null
        }
        Insert: {
          artist_id: string
          created_at?: string
          id?: string
          image_path?: string | null
          media_url?: string | null
          position?: number
          title?: string | null
          year?: number | null
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          image_path?: string | null
          media_url?: string | null
          position?: number
          title?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          org_type: string | null
          organization: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id: string
          org_type?: string | null
          organization: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          org_type?: string | null
          organization?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["review_status"]
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["review_status"]
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["review_status"]
        }
        Relationships: []
      }
      reports: {
        Row: {
          contact: string | null
          created_at: string
          handled: boolean
          id: string
          reason: string
          target_id: string
          target_type: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          handled?: boolean
          id?: string
          reason: string
          target_id: string
          target_type: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          handled?: boolean
          id?: string
          reason?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          content: string
          cover_path: string | null
          created_at: string
          excerpt: string | null
          featured_until: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          category: string
          content: string
          cover_path?: string | null
          created_at?: string
          excerpt?: string | null
          featured_until?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          cover_path?: string | null
          created_at?: string
          excerpt?: string | null
          featured_until?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          commission_rate: number
          id: boolean
          legal_mentions: string | null
          privacy_policy: string | null
          terms_of_sale: string | null
          terms_of_use: string | null
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          commission_rate?: number
          id?: boolean
          legal_mentions?: string | null
          privacy_policy?: string | null
          terms_of_sale?: string | null
          terms_of_use?: string | null
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          commission_rate?: number
          id?: boolean
          legal_mentions?: string | null
          privacy_policy?: string | null
          terms_of_sale?: string | null
          terms_of_use?: string | null
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
            admin_delete_artist: {
        Args: { p_id: string }
        Returns: undefined
      }
            admin_emails: {
        Args: { ids: string[] }
        Returns: {
          email: string
          id: string
          last_sign_in_at: string
        }[]
      }
      create_order: {
        Args: {
          p_artwork_id: string
          p_buyer_name?: string
          p_buyer_phone?: string
        }
        Returns: {
          reference: string
          whatsapp_number: string
        }[]
      }
    }
    Enums: {
      artwork_kind: "physical" | "digital"
      opportunity_type:
        | "residence"
        | "call_for_projects"
        | "contest"
        | "grant"
        | "training"
        | "other"
      order_status:
        | "new"
        | "confirmed"
        | "paid"
        | "delivered"
        | "artist_paid"
        | "cancelled"
      review_status: "pending" | "approved" | "rejected"
      user_role: "artist" | "pro" | "admin" | "superadmin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      artwork_kind: ["physical", "digital"],
      opportunity_type: [
        "residence",
        "call_for_projects",
        "contest",
        "grant",
        "training",
        "other",
      ],
      order_status: [
        "new",
        "confirmed",
        "paid",
        "delivered",
        "artist_paid",
        "cancelled",
      ],
      review_status: ["pending", "approved", "rejected"],
      user_role: ["artist", "pro", "admin", "superadmin"],
    },
  },
} as const
