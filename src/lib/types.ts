export type UserRole = 'admin' | 'family_member';
export type DeliveryMethod = 'whatsapp' | 'sms' | 'email';
export type StorytellerLanguage = 'de' | 'sv' | 'en';
export type SubscriptionStatus = 'active' | 'completed' | 'cancelled';
export type RecordingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  posthog_distinct_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Storyteller {
  id: string;
  buyer_id: string;
  name: string;
  phone_number: string | null;
  email: string | null;
  delivery_method: DeliveryMethod;
  language: StorytellerLanguage;
  timezone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  buyer_id: string;
  storyteller_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_checkout_session_id: string | null;
  status: SubscriptionStatus;
  amount_paid: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  category: string;
  question_de: string;
  question_sv: string | null;
  question_en: string | null;
  week_number: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Recording {
  id: string;
  storyteller_id: string;
  prompt_id: string | null;
  subscription_id: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  raw_transcript: string | null;
  cleaned_story: string | null;
  qr_code_url: string | null;
  status: RecordingStatus;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface MagicLink {
  token: string;
  storyteller_id: string;
  prompt_id: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  storyteller_id: string;
  invited_by: string | null;
  role: UserRole;
  created_at: string;
}

export interface Photo {
  id: string;
  recording_id: string;
  uploaded_by: string | null;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface BookOrder {
  id: string;
  subscription_id: string;
  buyer_id: string;
  status: string;
  pdf_url: string | null;
  print_provider: string | null;
  print_order_id: string | null;
  story_count: number | null;
  page_count: number | null;
  copies: number;
  shipping_address: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface PromptDispatch {
  id: string;
  storyteller_id: string;
  prompt_id: string;
  magic_link_token: string | null;
  delivery_method: DeliveryMethod;
  delivery_status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface RecordingWithPrompt extends Recording {
  prompt?: Prompt;
  storyteller?: Storyteller;
  photos?: Photo[];
}

export interface StorytellerWithRecordings extends Storyteller {
  recordings?: Recording[];
  subscription?: Subscription;
}
