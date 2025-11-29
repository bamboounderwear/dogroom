export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
// Minimal real-world chat example types (shared by frontend and worker)
export interface User {
  id: string;
  name: string;
  avatar?: string;
}
export interface Chat {
  id: string;
  title: string;
  // For UI: add participants info
  participants?: User[];
  lastMessage?: ChatMessage;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}
// DogRoom specific types
export type PetSize = 'small' | 'medium' | 'large';
export type ServiceType = 'boarding' | 'daycare' | 'walking';
export interface Availability {
  date: number; // epoch millis for the start of the day
  isAvailable: boolean;
}
export interface Review {
    id: string;
    hostId: string;
    userId: string;
    rating: number; // 1-5
    comment: string;
    ts: number;
    user?: User; // populated on fetch
}
export interface Host {
  id: string;
  name: string;
  avatar?: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  tags: ServiceType[];
  pricePerNight: number;
  location: {
    city: string;
    lat: number;
    lng: number;
  };
  availability: Availability[];
  verified: boolean;
  houseRules: string[];
  gallery: string[];
  allowedPetSizes: PetSize[];
  reviews?: Review[]; // populated on fetch
}
export interface Booking {
  id: string;
  hostId: string;
  userId: string;
  from: number; // epoch millis
  to: number; // epoch millis
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  createdAt: number;
}
export interface HostPreview {
  id: string;
  name: string;
  avatar?: string;
  pricePerNight: number;
  rating: number;
  tags: ServiceType[];
  location: {
    city: string;
    lat: number;
    lng: number;
  };
  score?: number;
}