export type Category = "music" | "tech" | "comedy" | "lifestyle" | "food" | "art" | "sports" | "professional";

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  total: number;
}

export interface EventItem {
  id: string;
  title: string;
  organizer: string;
  organizerVerified: boolean;
  category: Category;
  date: string;
  doorsOpen: string;
  venue: string;
  area: string;
  heroImage: string;
  description: string;
  tiers: TicketTier[];
  rating: number;
  reviewCount: number;
  trending: boolean;
  isSoldOut?: boolean;
}

export interface Ticket {
  id: string;
  eventId: string;
  tierId: string;
  tierName: string;
  quantity: number;
  holderName: string;
  purchasedAt: string;
  total: number;
}

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&h=1000&fit=crop&q=80`;

export const EVENTS: EventItem[] = [
  {
    id: "evt-1",
    title: "Afrobeats Live: Lagos Sessions",
    organizer: "Soundstage Lagos",
    organizerVerified: true,
    category: "music",
    date: "2026-06-14T20:00",
    doorsOpen: "7:00 PM",
    venue: "Hard Rock Cafe",
    area: "Victoria Island",
    heroImage: img("photo-1429962714451-bb934ecdc4ec"),
    description: "An intimate night of live Afrobeats from three rising artists. Limited capacity, full house energy.",
    trending: true,
    rating: 4.7,
    reviewCount: 234,
    tiers: [
      { id: "t1a", name: "Regular", price: 8000, description: "Standing, general access", available: 120, total: 200 },
      { id: "t1b", name: "VIP", price: 18000, description: "Reserved seating, welcome drink", available: 12, total: 50 },
      { id: "t1c", name: "Table for 4", price: 80000, description: "Private table, bottle service", available: 3, total: 10 },
    ],
  },
  {
    id: "evt-2",
    title: "Stand-Up Saturday with Basketmouth",
    organizer: "Laugh Out Loud Lagos",
    organizerVerified: true,
    category: "comedy",
    date: "2026-06-15T19:30",
    doorsOpen: "7:00 PM",
    venue: "Eko Hotel Convention Centre",
    area: "Victoria Island",
    heroImage: img("photo-1527224538127-2104bb71c51b"),
    description: "Headliner Basketmouth plus three opening acts. Doors at 7, show at 8.",
    trending: true,
    rating: 4.9,
    reviewCount: 891,
    tiers: [
      { id: "t2a", name: "Regular", price: 12000, description: "General seating", available: 0, total: 400 },
      { id: "t2b", name: "Premium", price: 25000, description: "Front section", available: 45, total: 100 },
      { id: "t2c", name: "VIP Table", price: 150000, description: "Reserved table for 6", available: 2, total: 8 },
    ],
  },
  {
    id: "evt-3",
    title: "Lagos Tech Meetup: AI and the Future of Work",
    organizer: "Devcenter Africa",
    organizerVerified: true,
    category: "tech",
    date: "2026-06-18T18:00",
    doorsOpen: "5:30 PM",
    venue: "Workstation Lekki",
    area: "Lekki Phase 1",
    heroImage: img("photo-1540575467063-178a50c2df87"),
    description: "Talks from engineers at Paystack, Flutterwave, and a panel on building AI products for the African market.",
    trending: false,
    rating: 4.5,
    reviewCount: 67,
    tiers: [
      { id: "t3a", name: "Free", price: 0, description: "Talks only", available: 180, total: 250 },
      { id: "t3b", name: "Networking pass", price: 3500, description: "Includes post-event mixer", available: 40, total: 60 },
    ],
  },
  {
    id: "evt-4",
    title: "Sunday Brunch at The Wine Shop",
    organizer: "The Wine Shop Lagos",
    organizerVerified: true,
    category: "food",
    date: "2026-06-15T12:00",
    doorsOpen: "11:30 AM",
    venue: "The Wine Shop",
    area: "Ikoyi",
    heroImage: img("photo-1414235077428-338989a2e8c0"),
    description: "Bottomless mimosas, live acoustic set, three-course brunch. Smart casual.",
    trending: false,
    rating: 4.6,
    reviewCount: 156,
    tiers: [
      { id: "t4a", name: "Brunch + 1 drink", price: 15000, description: "3-course menu with one mimosa", available: 30, total: 60 },
      { id: "t4b", name: "Bottomless", price: 25000, description: "Unlimited mimosas, 2 hours", available: 22, total: 50 },
    ],
  },
  {
    id: "evt-5",
    title: "Eko Art Walk",
    organizer: "Nike Art Gallery",
    organizerVerified: true,
    category: "art",
    date: "2026-06-21T11:00",
    doorsOpen: "10:30 AM",
    venue: "Nike Art Gallery",
    area: "Lekki Phase 1",
    heroImage: img("photo-1531913764164-f85c52e6e654"),
    description: "Guided tour of contemporary West African art, plus a talk with three featured artists.",
    trending: false,
    rating: 4.8,
    reviewCount: 43,
    tiers: [
      { id: "t5a", name: "Standard", price: 5000, description: "Tour + talk", available: 18, total: 40 },
      { id: "t5b", name: "With catalogue", price: 8500, description: "Includes printed catalogue", available: 9, total: 20 },
    ],
  },
  {
    id: "evt-6",
    title: "Rooftop & Vibes: Saturday Edition",
    organizer: "Sky Lagos",
    organizerVerified: false,
    category: "lifestyle",
    date: "2026-06-14T22:00",
    doorsOpen: "9:30 PM",
    venue: "Sky Lounge",
    area: "Lekki Phase 1",
    heroImage: img("photo-1566737236500-c8ac43014a67"),
    description: "Open-air rooftop, three DJs, until 4am. Smart dress code enforced.",
    trending: true,
    rating: 4.3,
    reviewCount: 312,
    tiers: [
      { id: "t6a", name: "Early bird", price: 7500, description: "Before 11pm", available: 0, total: 100 },
      { id: "t6b", name: "Regular", price: 10000, description: "General entry", available: 35, total: 200 },
      { id: "t6c", name: "Table", price: 60000, description: "Reserved table for 6", available: 4, total: 15 },
    ],
  },
  {
    id: "evt-7",
    title: "PitchLab: Founders Demo Day",
    organizer: "PitchLab Africa",
    organizerVerified: true,
    category: "professional",
    date: "2026-06-19T14:00",
    doorsOpen: "1:30 PM",
    venue: "Sterling Tower",
    area: "Marina",
    heroImage: img("photo-1556761175-5973dc0f32e7"),
    description: "Eight startups pitch to investors, followed by networking. Snacks and drinks provided.",
    trending: false,
    rating: 4.4,
    reviewCount: 89,
    tiers: [
      { id: "t7a", name: "General", price: 5000, description: "Pitches + networking", available: 80, total: 150 },
      { id: "t7b", name: "Investor track", price: 20000, description: "Private investor lounge", available: 12, total: 30 },
    ],
  },
  {
    id: "evt-8",
    title: "Lagos vs Abuja: 7s Rugby Showdown",
    organizer: "Lagos Rugby Club",
    organizerVerified: true,
    category: "sports",
    date: "2026-06-22T15:00",
    doorsOpen: "2:00 PM",
    venue: "Lagos Polo Club",
    area: "Ikoyi",
    heroImage: img("photo-1546608235-3310a2494cdf"),
    description: "Two halves of fast 7s rugby. Beer garden and food trucks on site.",
    trending: false,
    rating: 4.2,
    reviewCount: 28,
    tiers: [
      { id: "t8a", name: "Standing", price: 2500, description: "Touchline standing", available: 200, total: 400 },
      { id: "t8b", name: "Seated", price: 5000, description: "Reserved stand", available: 80, total: 150 },
      { id: "t8c", name: "Hospitality", price: 18000, description: "Tent + open bar", available: 20, total: 50 },
    ],
  },
  {
    id: "evt-9",
    title: "Afro House Sundays",
    organizer: "Soundstage Lagos",
    organizerVerified: true,
    category: "music",
    date: "2026-06-22T16:00",
    doorsOpen: "3:30 PM",
    venue: "Hard Rock Cafe",
    area: "Victoria Island",
    heroImage: img("photo-1493676304819-0d7a8d026dcf"),
    description: "Curated Afro house from sundown to 11pm. Outdoor seating, full kitchen.",
    trending: false,
    rating: 4.5,
    reviewCount: 178,
    tiers: [{ id: "t9a", name: "Regular", price: 5500, description: "General entry", available: 90, total: 200 }],
  },
  {
    id: "evt-10",
    title: "Women in Tech Lagos: Monthly Mixer",
    organizer: "WIT Lagos",
    organizerVerified: true,
    category: "tech",
    date: "2026-06-26T18:30",
    doorsOpen: "6:00 PM",
    venue: "Co-Creation Hub",
    area: "Yaba",
    heroImage: img("photo-1573164713988-8665fc963095"),
    description: "Lightning talks plus 90-minute structured networking. All women in tech and allies welcome.",
    trending: false,
    rating: 4.7,
    reviewCount: 134,
    tiers: [
      { id: "t10a", name: "Member", price: 2000, description: "WIT members", available: 30, total: 60 },
      { id: "t10b", name: "Non-member", price: 4500, description: "General", available: 18, total: 40 },
    ],
  },
  {
    id: "evt-11",
    title: "Lagos Food Festival 2026",
    organizer: "Eat Lagos",
    organizerVerified: true,
    category: "food",
    date: "2026-07-05T11:00",
    doorsOpen: "10:30 AM",
    venue: "Federal Palace Hotel Lawn",
    area: "Victoria Island",
    heroImage: img("photo-1555939594-58d7cb561ad1"),
    description: "Forty restaurants, three live cooking stages, kids zone. Single-day pass includes 10 food tokens.",
    trending: true,
    rating: 4.6,
    reviewCount: 412,
    tiers: [
      { id: "t11a", name: "Day pass", price: 6000, description: "Entry + 10 tokens", available: 0, total: 1000 },
      { id: "t11b", name: "VIP day pass", price: 18000, description: "VIP lounge + 20 tokens", available: 28, total: 100 },
    ],
  },
  {
    id: "evt-12",
    title: "Spoken Word Sundays",
    organizer: "Inkblot Café",
    organizerVerified: false,
    category: "art",
    date: "2026-06-15T17:00",
    doorsOpen: "4:30 PM",
    venue: "Inkblot Café",
    area: "Surulere",
    heroImage: img("photo-1499364615650-ec38552f4f34"),
    description: "Open mic night for poets and storytellers. Sign-up at the door, ₦500 from each ticket goes to the featured charity.",
    trending: false,
    rating: 4.4,
    reviewCount: 56,
    tiers: [{ id: "t12a", name: "Entry", price: 3000, description: "General entry", available: 25, total: 50 }],
  },
];

export const ORGANIZER_USER = {
  name: "Tunde Adeyemi",
  organization: "Soundstage Lagos",
  verified: true,
  eventIds: ["evt-1", "evt-9"],
};

export const ATTENDEE_USER = {
  name: "Chioma Okafor",
  initials: "CO",
  phone: "+234 803 *** 4521",
  email: "chioma.o@gmail.com",
  preferences: ["music", "comedy", "food"] as Category[],
  areas: ["Victoria Island", "Lekki Phase 1", "Ikoyi"],
};

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "music", label: "Music" },
  { id: "comedy", label: "Comedy" },
  { id: "tech", label: "Tech" },
  { id: "food", label: "Food" },
  { id: "art", label: "Art" },
  { id: "sports", label: "Sports" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "professional", label: "Professional" },
];

export const AREAS = ["Victoria Island", "Lekki Phase 1", "Ikoyi", "Yaba", "Surulere", "Ikeja"];

export const SAMPLE_REVIEWS = [
  { name: "Adaeze N.", rating: 5, text: "Sound was crisp, crowd was lovely. Worth every kobo." },
  { name: "Tunde A.", rating: 4, text: "Good vibes, queue at the door was a bit long though." },
  { name: "Sade O.", rating: 5, text: "Best Saturday in a while. Already booked the next one." },
];

export const SCAN_NAMES = ["Ngozi Eze", "Wale Bakare", "Funmi Adediran", "Ibrahim Yusuf", "Bose Adeleke", "Kunle Sanya", "Aisha Bello"];

export const formatNaira = (n: number) => "₦" + n.toLocaleString("en-NG");

export const minTierPrice = (e: EventItem) => Math.min(...e.tiers.map(t => t.price));
export const isEventSoldOut = (e: EventItem) => e.tiers.every(t => t.available === 0);