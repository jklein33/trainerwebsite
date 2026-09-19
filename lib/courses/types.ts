export type ContentStatus = "draft" | "published" | "archived";
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichNode[];
};
export type Course = {
  id: string;
  title: string;
  summary: string;
  status: ContentStatus;
  position: number;
  stripe_price_id: string | null;
  thumbnail_asset_id: string | null;
  created_at: string;
  updated_at: string;
};
export type Module = {
  id: string;
  course_id: string;
  title: string;
  status: ContentStatus;
  position: number;
  created_at: string;
};
export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: RichNode;
  video_asset_id: string | null;
  status: ContentStatus;
  position: number;
  created_at: string;
};
export type Asset = {
  id: string;
  course_id: string;
  name: string;
  path: string;
  kind: "video" | "image" | "attachment";
  mime_type: string;
  size_bytes: number;
  status: "uploading" | "ready" | "archived";
  created_at: string;
};
export type Attachment = { id: string; lesson_id: string; asset_id: string };
export type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: "admin" | "learner";
  suspended: boolean;
  created_at: string;
};
export type Entitlement = {
  id: string;
  user_id: string;
  course_id: string;
  source: "purchase" | "manual" | "migration";
  source_id: string;
  active: boolean;
  expires_at: string | null;
  note: string;
  created_at: string;
};
export type Order = {
  id: string;
  user_id: string;
  course_id: string;
  stripe_price_id: string;
  checkout_session_id: string | null;
  payment_intent_id: string | null;
  status: "pending" | "paid" | "refunded" | "disputed" | "failed";
  created_at: string;
  updated_at: string;
};
export type PaymentEvent = {
  id: string;
  type: string;
  order_id: string | null;
  status: string;
  error: string | null;
  created_at: string;
  processed_at: string | null;
};
export type Audit = {
  id: number;
  actor_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
};
type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};
type PublicDatabase = {
  public: {
    Tables: {
      courses: Table<Course>;
      course_modules: Table<Module>;
      course_lessons: Table<Lesson>;
      course_assets: Table<Asset>;
      course_attachments: Table<Attachment>;
      course_profiles: Table<Profile>;
      course_entitlements: Table<Entitlement>;
      course_orders: Table<Order>;
      course_payment_events: Table<PaymentEvent>;
      course_audit_log: Table<Audit>;
    };
    Views: Record<string, never>;
    Functions: {
      course_is_admin: { Args: Record<string, never>; Returns: boolean };
      course_can_read: { Args: { target: string }; Returns: boolean };
      course_manage_access: {
        Args: {
          target_user: string;
          target_course: string;
          enabled: boolean;
          reason: string;
        };
        Returns: undefined;
      };
      course_suspend_member: {
        Args: { target_user: string; enabled: boolean };
        Returns: undefined;
      };
      course_reorder: {
        Args: { item_type: string; ordered_ids: string[] };
        Returns: undefined;
      };
      course_apply_payment: {
        Args: {
          target_order: string;
          target_state: string;
          session_ref: string | null;
          intent_ref: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Database = PublicDatabase & {
  course_staging: PublicDatabase["public"];
};
