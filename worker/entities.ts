/**
 * DogRoom Entities: HostEntity and BookingEntity
 */
import { IndexedEntity, Entity } from "./core-utils";
import type { User, Chat, ChatMessage, Host, Booking } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS, MOCK_HOSTS, MOCK_BOOKINGS } from "@shared/mock-data";
// USER ENTITY: one DO instance per user
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
// CHAT BOARD ENTITY: one DO instance per chat board, stores its own messages
export type ChatBoardState = Chat & { messages: ChatMessage[] };
const SEED_CHAT_BOARDS: ChatBoardState[] = MOCK_CHATS.map(c => ({
  ...c,
  messages: MOCK_CHAT_MESSAGES.filter(m => m.chatId === c.id),
}));
export class ChatBoardEntity extends IndexedEntity<ChatBoardState> {
  static readonly entityName = "chat";
  static readonly indexName = "chats";
  static readonly initialState: ChatBoardState = { id: "", title: "", messages: [] };
  static seedData = SEED_CHAT_BOARDS;
  async listMessages(): Promise<ChatMessage[]> {
    const { messages } = await this.getState();
    return messages;
  }
  async sendMessage(userId: string, text: string): Promise<ChatMessage> {
    const msg: ChatMessage = { id: crypto.randomUUID(), chatId: this.id, userId, text, ts: Date.now() };
    await this.mutate(s => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  }
}
// HOST ENTITY
export class HostEntity extends IndexedEntity<Host> {
  static readonly entityName = "host";
  static readonly indexName = "hosts";
  static readonly initialState: Host = {
    id: "",
    name: "",
    bio: "",
    rating: 0,
    reviewsCount: 0,
    tags: [],
    pricePerNight: 0,
    location: { city: "", x: 0, y: 0 },
    availability: [],
    verified: false,
    houseRules: [],
    gallery: [],
    allowedPetSizes: [],
  };
  static seedData = MOCK_HOSTS;
}
// BOOKING ENTITY
export class BookingEntity extends IndexedEntity<Booking> {
    static readonly entityName = "booking";
    static readonly indexName = "bookings";
    static readonly initialState: Booking = {
        id: "",
        hostId: "",
        userId: "",
        from: 0,
        to: 0,
        status: 'pending',
        createdAt: 0,
    };
    static seedData = MOCK_BOOKINGS;
}