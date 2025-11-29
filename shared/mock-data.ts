import type { User, Chat, ChatMessage, Host, Booking, PetSize, ServiceType, Review } from './types';
export const DEMO_USER_ID = 'u1';
export const MOCK_USERS: User[] = [
  { id: DEMO_USER_ID, name: 'Alex Doe', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'u2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' }
];
export const MOCK_CHATS: Chat[] = [
  { id: 'c1', title: 'Chat with Sarah', participants: [MOCK_USERS[0], {id: 'h1', name: 'Sarah'}] },
  { id: 'c2', title: 'Booking Inquiry - Mike', participants: [MOCK_USERS[0], {id: 'h2', name: 'Mike'}] },
];
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', chatId: 'c1', userId: 'u1', text: 'Hi Sarah! Just wanted to confirm our booking for next week. Sparky is very excited!', ts: Date.now() - 1000 * 60 * 5 },
  { id: 'm2', chatId: 'c1', userId: 'h1', text: 'Hi Alex! Yes, all confirmed. We can\'t wait to meet Sparky!', ts: Date.now() - 1000 * 60 * 2 },
  { id: 'm3', chatId: 'c2', userId: 'u1', text: 'Hello, I was wondering if you have availability for a large dog in August?', ts: Date.now() - 1000 * 60 * 60 * 24 },
];
export const MOCK_HOSTS: Host[] = [
  {
    id: 'h1',
    name: 'Sarah\'s Pawsome Place',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    bio: 'A loving home for your furry friends. I have a big backyard and two friendly golden retrievers. I work from home, so your dog will have constant supervision and companionship.',
    rating: 4.9,
    reviewsCount: 120,
    tags: ['boarding', 'daycare'],
    pricePerNight: 55,
    location: { city: 'Quebec', lat: 46.813, lng: -71.208 },
    availability: [],
    verified: true,
    houseRules: ['Dogs must be house-trained.', 'Must be friendly with other dogs.', 'Up-to-date on vaccinations.'],
    gallery: ['/placeholder-dog-1.svg', '/placeholder-dog-2.svg', '/placeholder-dog-3.svg', '/placeholder-dog-4.svg'],
    allowedPetSizes: ['small', 'medium'],
  },
  {
    id: 'h2',
    name: 'Mike\'s Dog Haven',
    avatar: 'https://i.pravatar.cc/150?u=mike',
    bio: 'Experienced dog sitter with a passion for large breeds. I offer long walks, runs, and plenty of playtime. Your dog will be treated like family.',
    rating: 4.8,
    reviewsCount: 85,
    tags: ['boarding', 'walking'],
    pricePerNight: 60,
    location: { city: 'Quebec', lat: 46.850, lng: -71.300 },
    availability: [],
    verified: true,
    houseRules: ['Large breeds welcome!', 'No aggressive dogs.', 'Provide your own dog food.'],
    gallery: ['/placeholder-dog-2.svg', '/placeholder-dog-3.svg', '/placeholder-dog-4.svg', '/placeholder-dog-1.svg'],
    allowedPetSizes: ['large'],
  },
  {
    id: 'h3',
    name: 'Cozy Critter Care',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    bio: 'Perfect for small, shy, or senior dogs who need a quiet and calm environment. I provide a peaceful home with lots of cuddles and one-on-one attention.',
    rating: 5.0,
    reviewsCount: 210,
    tags: ['boarding', 'daycare'],
    pricePerNight: 50,
    location: { city: 'Quebec', lat: 46.780, lng: -71.250 },
    availability: [],
    verified: true,
    houseRules: ['Small dogs only (under 20lbs).', 'Must be okay with cats (I have one).', 'Special needs dogs welcome.'],
    gallery: ['/placeholder-dog-3.svg', '/placeholder-dog-4.svg', '/placeholder-dog-1.svg', '/placeholder-dog-2.svg'],
    allowedPetSizes: ['small'],
  },
  {
    id: 'h4',
    name: 'Adventure Pups',
    avatar: 'https://i.pravatar.cc/150?u=jake',
    bio: 'For the active dog! We go on daily hikes, to the dog park, and have structured play sessions. If your dog has endless energy, this is the place for them.',
    rating: 4.7,
    reviewsCount: 95,
    tags: ['daycare', 'walking'],
    pricePerNight: 45,
    location: { city: 'Quebec', lat: 46.900, lng: -71.350 },
    availability: [],
    verified: false,
    houseRules: ['High-energy dogs preferred.', 'Must have good recall.', 'Provide a sturdy leash and harness.'],
    gallery: ['/placeholder-dog-4.svg', '/placeholder-dog-1.svg', '/placeholder-dog-2.svg', '/placeholder-dog-3.svg'],
    allowedPetSizes: ['medium', 'large'],
  },
];
export const MOCK_REVIEWS: Review[] = [
    { id: 'r1', hostId: 'h1', userId: 'u2', rating: 5, comment: 'Sarah was amazing! Our dog came back so happy and tired. We got daily photo updates. Highly recommend!', ts: Date.now() - 1000 * 60 * 60 * 24 * 5 },
    { id: 'r2', hostId: 'h1', userId: DEMO_USER_ID, rating: 5, comment: 'The best sitter we\'ve ever had. Her dogs are super friendly and her backyard is perfect.', ts: Date.now() - 1000 * 60 * 60 * 24 * 15 },
    { id: 'r3', hostId: 'h2', userId: 'u2', rating: 4, comment: 'Mike is great with big dogs. Our German Shepherd had a blast. A bit pricey but worth it for the peace of mind.', ts: Date.now() - 1000 * 60 * 60 * 24 * 8 },
    { id: 'r4', hostId: 'h3', userId: DEMO_USER_ID, rating: 5, comment: 'Our senior chihuahua is very anxious, but she felt right at home here. So grateful for the calm environment.', ts: Date.now() - 1000 * 60 * 60 * 24 * 3 },
];
export const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'b1',
        hostId: 'h1',
        userId: DEMO_USER_ID,
        from: new Date(new Date().setDate(new Date().getDate() + 5)).getTime(),
        to: new Date(new Date().setDate(new Date().getDate() + 8)).getTime(),
        status: 'confirmed',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
        id: 'b2',
        hostId: 'h3',
        userId: DEMO_USER_ID,
        from: new Date(new Date().setDate(new Date().getDate() + 15)).getTime(),
        to: new Date(new Date().setDate(new Date().getDate() + 20)).getTime(),
        status: 'pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 24,
    }
];