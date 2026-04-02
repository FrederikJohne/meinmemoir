export type UserRole = "admin" | "family_member";
export type DeliveryMethod = "whatsapp" | "sms" | "email";
export type Language = "de" | "sv" | "en";
export type SubscriptionStatus = "active" | "completed" | "cancelled";
export type RecordingStatus = "pending" | "processing" | "completed" | "failed";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  posthog_distinct_id: string | null;
  created_at: string;
}

export interface Storyteller {
  id: string;
  name: string;
  phone_number: string;
  delivery_method: DeliveryMethod;
  language: Language;
  timezone: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  buyer_id: string;
  storyteller_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  created_at: string;
}

export interface Prompt {
  id: string;
  category: string;
  question_de: string;
  question_sv: string;
  question_en: string;
  week_number: number;
}

export interface Recording {
  id: string;
  storyteller_id: string;
  prompt_id: string;
  audio_url: string;
  raw_transcript: string | null;
  cleaned_story: string | null;
  qr_code_url: string | null;
  status: RecordingStatus;
  created_at: string;
}

export interface MagicLink {
  token: string;
  storyteller_id: string;
  prompt_id: string;
  expires_at: string;
  used: boolean;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at">;
        Update: Partial<User>;
      };
      storytellers: {
        Row: Storyteller;
        Insert: Omit<Storyteller, "id" | "created_at">;
        Update: Partial<Storyteller>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at">;
        Update: Partial<Subscription>;
      };
      prompts: {
        Row: Prompt;
        Insert: Omit<Prompt, "id">;
        Update: Partial<Prompt>;
      };
      recordings: {
        Row: Recording;
        Insert: Omit<Recording, "id" | "created_at">;
        Update: Partial<Recording>;
      };
      magic_links: {
        Row: MagicLink;
        Insert: MagicLink;
        Update: Partial<MagicLink>;
      };
    };
  };
}
