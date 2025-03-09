// WhatsApp webhook event types

export interface WhatsAppWebhookEvent {
  object: string;
  entry: Entry[];
}

export interface Entry {
  id: string;
  changes: Change[];
}

export interface Change {
  value: Value;
  field: string;
}

export interface Value {
  messaging_product: string;
  metadata: Metadata;
  contacts?: Contact[];
  messages?: Message[];
  statuses?: Status[];
}

export interface Metadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface Contact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface Message {
  from: string;
  id: string;
  timestamp: string;
  type: MessageType;
  text?: TextMessage;
  image?: MediaMessage;
  audio?: MediaMessage;
  document?: DocumentMessage;
  video?: MediaMessage;
  sticker?: MediaMessage;
  location?: LocationMessage;
  contacts?: ContactMessage[];
  context?: Context;
}

export interface Status {
  id: string;
  recipient_id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  conversation?: {
    id: string;
    origin?: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: {
    code: number;
    title: string;
  }[];
}

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'audio' 
  | 'document' 
  | 'video' 
  | 'sticker' 
  | 'location' 
  | 'contacts';

export interface TextMessage {
  body: string;
}

export interface MediaMessage {
  caption?: string;
  mime_type: string;
  sha256: string;
  id: string;
}

export interface DocumentMessage extends MediaMessage {
  filename: string;
}

export interface LocationMessage {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface ContactMessage {
  addresses?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    type?: string;
  }[];
  emails?: {
    email?: string;
    type?: string;
  }[];
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    suffix?: string;
    prefix?: string;
  };
  phones?: {
    phone?: string;
    type?: string;
    wa_id?: string;
  }[];
}

export interface Context {
  from?: string;
  id?: string;
  forwarded?: boolean;
  frequently_forwarded?: boolean;
} 