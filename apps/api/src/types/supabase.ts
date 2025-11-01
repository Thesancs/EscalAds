export type Json =
  | string
  | number
  | boolean
  | null
  | {[key: string]: Json | undefined}
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'OWNER' | 'ADMIN' | 'MEMBER';
          api_key_hash: string | null;
          api_key_last_rotated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER';
          api_key_hash?: string | null;
          api_key_last_rotated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          role?: 'OWNER' | 'ADMIN' | 'MEMBER';
          api_key_hash?: string | null;
          api_key_last_rotated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      api_key_audit: {
        Row: {
          id: string;
          profile_id: string;
          event: 'ISSUED' | 'ROTATED' | 'REVOKED';
          api_key_prefix: string;
          performed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          event: 'ISSUED' | 'ROTATED' | 'REVOKED';
          api_key_prefix: string;
          performed_by: string;
          created_at?: string;
        };
        Update: {
          profile_id?: string;
          event?: 'ISSUED' | 'ROTATED' | 'REVOKED';
          api_key_prefix?: string;
          performed_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'api_key_audit_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'api_key_audit_performed_by_fkey';
            columns: ['performed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      ads: {
        Row: {
          id: string;
          ad_library_id: string;
          advertiser_name: string;
          platform: 'FACEBOOK' | 'INSTAGRAM';
          page_url: string | null;
          primary_text: string | null;
          headline: string | null;
          call_to_action: string | null;
          countries: string[];
          languages: string[];
          creative_format: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'HTML5';
          spend_bucket: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | null;
          variations_count: number;
          is_active: boolean;
          first_seen_at: string;
          last_seen_at: string;
          impressions_range: string | null;
          captured_by_profile: string | null;
          source_type: 'EXTENSION' | 'USER_CUSTOM';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ad_library_id: string;
          advertiser_name: string;
          platform: 'FACEBOOK' | 'INSTAGRAM';
          page_url?: string | null;
          primary_text?: string | null;
          headline?: string | null;
          call_to_action?: string | null;
          countries?: string[];
          languages?: string[];
          creative_format: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'HTML5';
          spend_bucket?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | null;
          variations_count?: number;
          is_active?: boolean;
          first_seen_at: string;
          last_seen_at: string;
          impressions_range?: string | null;
          captured_by_profile?: string | null;
          source_type?: 'EXTENSION' | 'USER_CUSTOM';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          ad_library_id?: string;
          advertiser_name?: string;
          platform?: 'FACEBOOK' | 'INSTAGRAM';
          page_url?: string | null;
          primary_text?: string | null;
          headline?: string | null;
          call_to_action?: string | null;
          countries?: string[];
          languages?: string[];
          creative_format?: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'HTML5';
          spend_bucket?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | null;
          variations_count?: number;
          is_active?: boolean;
          first_seen_at?: string;
          last_seen_at?: string;
          impressions_range?: string | null;
          captured_by_profile?: string | null;
          source_type?: 'EXTENSION' | 'USER_CUSTOM';
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ads_captured_by_profile_fkey';
            columns: ['captured_by_profile'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      ad_assets: {
        Row: {
          id: string;
          ad_id: string;
          type: 'IMAGE' | 'VIDEO' | 'UNKNOWN';
          mime_type: string;
          storage_key: string;
          storage_bucket: string;
          width: number | null;
          height: number | null;
          duration_ms: number | null;
          checksum: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ad_id: string;
          type: 'IMAGE' | 'VIDEO' | 'UNKNOWN';
          mime_type?: string;
          storage_key: string;
          storage_bucket: string;
          width?: number | null;
          height?: number | null;
          duration_ms?: number | null;
          checksum?: string | null;
        };
        Update: {
          type?: 'IMAGE' | 'VIDEO' | 'UNKNOWN';
          mime_type?: string;
          storage_key?: string;
          storage_bucket?: string;
          width?: number | null;
          height?: number | null;
          duration_ms?: number | null;
          checksum?: string | null;
          ad_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ad_assets_ad_id_fkey';
            columns: ['ad_id'];
            referencedRelation: 'ads';
            referencedColumns: ['id'];
          }
        ];
      };
      ad_metrics: {
        Row: {
          ad_id: string;
          total_observations: number;
          active_days: number;
          variants_count: number;
          country_spread: number;
          language_spread: number;
          similar_ads_count: number;
          advertiser_total_ads: number;
          advertiser_active_ads: string[];
          last_seen_at: string;
          first_seen_at: string;
          updated_at: string;
        };
        Insert: {
          ad_id: string;
          total_observations?: number;
          active_days?: number;
          variants_count?: number;
          country_spread?: number;
          language_spread?: number;
          similar_ads_count?: number;
          advertiser_total_ads?: number;
          advertiser_active_ads?: string[];
          last_seen_at: string;
          first_seen_at: string;
        };
        Update: {
          total_observations?: number;
          active_days?: number;
          variants_count?: number;
          country_spread?: number;
          language_spread?: number;
          similar_ads_count?: number;
          advertiser_total_ads?: number;
          advertiser_active_ads?: string[];
          last_seen_at?: string;
          first_seen_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ad_metrics_ad_id_fkey';
            columns: ['ad_id'];
            referencedRelation: 'ads';
            referencedColumns: ['id'];
          }
        ];
      };
      ad_snapshots: {
        Row: {
          id: string;
          ad_id: string | null;
          ad_library_id: string;
          raw_payload: Json;
          captured_by: string | null;
          captured_at: string;
          processed: boolean;
          processing_log: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ad_id?: string | null;
          ad_library_id: string;
          raw_payload: Json;
          captured_by?: string | null;
          captured_at?: string;
          processed?: boolean;
          processing_log?: string | null;
        };
        Update: {
          ad_id?: string | null;
          ad_library_id?: string;
          raw_payload?: Json;
          captured_by?: string | null;
          captured_at?: string;
          processed?: boolean;
          processing_log?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ad_snapshots_ad_id_fkey';
            columns: ['ad_id'];
            referencedRelation: 'ads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ad_snapshots_captured_by_fkey';
            columns: ['captured_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      extension_captures: {
        Row: {
          id: string;
          ad_id: string;
          snapshot_id: string;
          captured_by: string | null;
          captured_at: string;
          similar_ads_payload: Json | null;
          advertiser_meta: Json | null;
          extension_version: string | null;
          api_key_fingerprint: string | null;
        };
        Insert: {
          id?: string;
          ad_id: string;
          snapshot_id: string;
          captured_by?: string | null;
          captured_at?: string;
          similar_ads_payload?: Json | null;
          advertiser_meta?: Json | null;
          extension_version?: string | null;
          api_key_fingerprint?: string | null;
        };
        Update: {
          ad_id?: string;
          snapshot_id?: string;
          captured_by?: string | null;
          captured_at?: string;
          similar_ads_payload?: Json | null;
          advertiser_meta?: Json | null;
          extension_version?: string | null;
          api_key_fingerprint?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'extension_captures_ad_id_fkey';
            columns: ['ad_id'];
            referencedRelation: 'ads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'extension_captures_snapshot_id_fkey';
            columns: ['snapshot_id'];
            referencedRelation: 'ad_snapshots';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'extension_captures_captured_by_fkey';
            columns: ['captured_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      extension_releases: {
        Row: {
          id: string;
          version: string;
          channel: 'STABLE' | 'BETA' | 'CANARY';
          package_url: string;
          checksum: string;
          created_at: string;
          created_by: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          version: string;
          channel: 'STABLE' | 'BETA' | 'CANARY';
          package_url: string;
          checksum: string;
          created_at?: string;
          created_by?: string | null;
          notes?: string | null;
        };
        Update: {
          version?: string;
          channel?: 'STABLE' | 'BETA' | 'CANARY';
          package_url?: string;
          checksum?: string;
          created_at?: string;
          created_by?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'extension_releases_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      user_custom_ads: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          platform: 'FACEBOOK' | 'INSTAGRAM';
          advertiser_name: string | null;
          reference_ad_id: string | null;
          similar_ads_meta: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          notes?: string | null;
          platform: 'FACEBOOK' | 'INSTAGRAM';
          advertiser_name?: string | null;
          reference_ad_id?: string | null;
          similar_ads_meta?: Json | null;
        };
        Update: {
          title?: string;
          notes?: string | null;
          platform?: 'FACEBOOK' | 'INSTAGRAM';
          advertiser_name?: string | null;
          reference_ad_id?: string | null;
          similar_ads_meta?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_custom_ads_reference_ad_id_fkey';
            columns: ['reference_ad_id'];
            referencedRelation: 'ads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_custom_ads_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      ad_platform: 'FACEBOOK' | 'INSTAGRAM';
      creative_format: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'HTML5';
      asset_type: 'IMAGE' | 'VIDEO' | 'UNKNOWN';
      spend_bucket: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
      source_type: 'EXTENSION' | 'USER_CUSTOM';
      extension_channel: 'STABLE' | 'BETA' | 'CANARY';
    };
  };
};
