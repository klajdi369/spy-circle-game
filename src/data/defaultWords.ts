import type { Category } from '../types/words';
import { generateUUID } from '../logic/random';

function generateId(): string {
  return generateUUID();
}

export function createDefaultCategories(): Category[] {
  return [
    {
      id: generateId(),
      name: 'Animals',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Countries',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Food',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Objects',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Places',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Professions',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Sports',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Transport',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Movies and TV',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
    {
      id: generateId(),
      name: 'Technology',
      enabled: true,
      isPredefined: true,
      originalWords: [],
      words: [],
    },
  ];
}

export const DEFAULT_WORDS: Record<string, string[]> = {
  Animals: [
    'Dog', 'Cat', 'Elephant', 'Lion', 'Dolphin', 'Penguin', 'Giraffe',
    'Kangaroo', 'Rabbit', 'Eagle', 'Shark', 'Wolf', 'Bear', 'Horse', 'Cow',
    'Goat', 'Pig', 'Chicken', 'Owl', 'Parrot', 'Crocodile', 'Turtle', 'Snake',
    'Frog', 'Octopus', 'Zebra', 'Monkey', 'Panda',
  ],
  Countries: [
    'Albania', 'Italy', 'Japan', 'Brazil', 'Canada', 'Egypt', 'France',
    'Germany', 'Greece', 'India', 'Australia', 'Argentina', 'China', 'Mexico',
    'Spain', 'Portugal', 'Sweden', 'Poland', 'Turkey', 'Thailand', 'Netherlands',
    'North Korea',
    'Austria', 'Switzerland', 'South Korea', 'Cuba', 'United States', 'United Kingdom',
  ],
  Food: [
    'Pizza', 'Pasta', 'Burger', 'Sushi', 'Pancake', 'Salad', 'Chocolate',
    'Sandwich', 'Popcorn', 'Ice Cream', 'Taco', 'Lasagna', 'Cake', 'Cookie',
    'Donut', 'Croissant', 'Omelette', 'Steak', 'Meatball', 'Soup', 'Fries',
    'Hot Dog', 'Sausage', 'Yogurt', 'Lemonade',
  ],
  Objects: [
    'Umbrella', 'Backpack', 'Mirror', 'Candle', 'Pillow', 'Toothbrush',
    'Camera', 'Scissors', 'Wallet', 'Ladder', 'Notebook', 'Sunglasses', 'Clock',
    'Compass', 'Headphones', 'Suitcase', 'Flashlight', 'Blanket', 'Teapot',
    'Vase', 'Screwdriver', 'Telescope', 'Microphone', 'Remote', 'Battery',
    'Calendar', 'Bell', 'Vacuum Cleaner',
  ],
  Places: [
    'Airport', 'Hospital', 'School', 'Beach', 'Library', 'Museum',
    'Restaurant', 'Hotel', 'Park', 'Supermarket', 'Bakery',
    'Stadium', 'Church', 'Cinema', 'Prison', 'Zoo', 'Desert', 'Island',
    'Forest', 'Post Office', 'Gas Station', 'Skyscraper',
  ],
  Professions: [
    'Doctor', 'Teacher', 'Chef', 'Pilot', 'Farmer', 'Dentist', 'Engineer',
    'Photographer', 'Firefighter', 'Musician', 'Artist', 'Lawyer', 'Nurse',
    'Architect', 'Scientist', 'Carpenter', 'Electrician', 'Plumber', 'Mechanic',
    'Veterinarian', 'Astronaut', 'Detective', 'Barber', 'Soldier', 'Waiter',
  ],
  Sports: [
    'Football', 'Basketball', 'Tennis', 'Swimming', 'Volleyball', 'Golf',
    'Boxing', 'Cycling', 'Skiing', 'Baseball', 'Hockey', 'Rugby',
    'Surfing', 'Skateboarding', 'Gymnastics', 'Wrestling', 'Bowling',
    'Climbing', 'Karate',
  ],
  Transport: [
    'Airplane', 'Bicycle', 'Bus', 'Train', 'Boat', 'Taxi', 'Motorcycle',
    'Helicopter', 'Subway', 'Tractor', 'Ambulance', 'Fire Truck', 'Cable Car',
    'Ferry', 'Rocket', 'Tram', 'Submarine',
  ],
  'Movies and TV': [
    'Actor', 'Director', 'Cinema', 'Episode', 'Comedy', 'Villain', 'Hero',
    'Cartoon', 'Documentary', 'Trailer', 'Script', 'Camera', 'Costume',
    'Soundtrack', 'Horror', 'Oscar', 'Dialogue',
  ],
  Technology: [
    'Laptop', 'Smartphone', 'Keyboard', 'Robot', 'Internet', 'Password',
    'Printer', 'Headphones', 'Website', 'Battery', 'Monitor', 'Microphone',
    'Speaker', 'Camera', 'Drone', 'Mouse', 'Server', 'Charger',
    'Projector', 'VR Headset',
  ],
};
