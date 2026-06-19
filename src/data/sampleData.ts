/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Property, Testimonial } from "../types";

export const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "Premium 3 BHK Apartment in Dwarka",
    description: "Experience luxury living in one of Dwarka's most sought-after residential sectors. This carefully designed 3 BHK home features high ceilings, premium Italian marble flooring, pre-installed split ACs, and a sprawling modular kitchen with chimney. Located in a secured, gated high-rise society with 24/7 power backup, high-speed automated elevators, a state-of-the-art gym, and professional multi-tier security. Perfect for families looking for a mixture of comfort, elegance, and stellar connectivity to Dwarka Expressway and Delhi Metro.",
    price: 8500000,
    priceString: "₹85 Lakhs",
    location: "Sector 10, Dwarka, Delhi",
    locality: "Dwarka Sector 10",
    city: "Dwarka",
    type: "Flat",
    category: "Buy",
    bhk: 3,
    area: 1450,
    areaUnit: "sqft",
    floor: "5th",
    facing: "North-East",
    ageOfProperty: "2 Years",
    furnishing: "Semi-Furnished",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Parking", "Lift", "Security", "Gym", "Power Backup", "Water Supply", "Garden", "Club House"],
    landmarks: [
      { name: "Dwarka Sector 10 Metro", type: "Metro Station" },
      { name: "Delhi Public School", type: "School" },
      { name: "Venkateshwar Hospital", type: "Hospital" },
      { name: "Pacific Mall Tagore Garden", type: "Mall" }
    ],
    featured: true,
    newLaunch: false,
    verified: true,
    listingStatus: "Ready to Move",
    status: "live",
    postedBy: "Agent",
    postedDate: "2026-06-01"
  },
  {
    id: "prop-2",
    title: "Modern 2 BHK Builder Floor",
    description: "A beautifully constructed independent builder floor situated in the leafy avenues of Pitampura. Designed with premium modern aesthetics, this ground-floor unit offers maximum privacy and excellent natural lighting. Built on a freehold plot with dedicated covered car parking, stylish False-ceilings with smart LED coves, a state-of-the-art modular kitchen, and luxury Jaguar bathroom fittings. Direct walking access to local parks and the bustling high-street markets, offering an unmatched private-residence lifestyle in North Delhi.",
    price: 5500000,
    priceString: "₹55 Lakhs",
    location: "Block RU, Pitampura, North Delhi",
    locality: "Pitampura",
    city: "Pitampura",
    type: "Builder Floor",
    category: "Buy",
    bhk: 2,
    area: 950,
    areaUnit: "sqft",
    floor: "Ground Floor",
    facing: "East",
    ageOfProperty: "1 Year",
    furnishing: "Fully Furnished",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Parking", "Security", "Water Supply", "Garden"],
    landmarks: [
      { name: "Pitampura Metro Station", type: "Metro Station" },
      { name: "Max Super Specialty Hospital", type: "Hospital" },
      { name: "D Mall Rohini", type: "Mall" }
    ],
    featured: true,
    newLaunch: false,
    verified: true,
    listingStatus: "Ready to Move",
    status: "live",
    postedBy: "Owner",
    postedDate: "2026-06-05"
  },
  {
    id: "prop-3",
    title: "Premium Commercial Shop in Sector 18",
    description: "High-exposure retail space located directly in Noida's primary commercial hub, Sector 18. This ground-floor commercial showroom features an expansive double-height glass frontage, offering ultimate visibility and maximum customer footfall. Located just a minute's walk from the Metro station, surrounded by top national banks, food courts, and premium outlets. Equipped with heavy load power allocation, separate wet-point provision, and centralized VRV air conditioning. Best suited for high-end retail, designer clothing boutiques, jewelry stores, or quick-service premium cafes.",
    price: 12000000,
    priceString: "₹1.2 Crore",
    location: "Sector 18 Hub, Noida",
    locality: "Noida Sector 18",
    city: "Noida",
    type: "Commercial",
    category: "Commercial",
    bhk: null,
    area: 450,
    areaUnit: "sqft",
    floor: "Ground Floor",
    facing: "West",
    ageOfProperty: "5 Years",
    furnishing: "Unfurnished",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Security", "Lift", "Power Backup", "Water Supply"],
    landmarks: [
      { name: "Noida Sector 18 Metro Station", type: "Metro Station" },
      { name: "The Great India Place Mall", type: "Mall" },
      { name: "DLF Mall of India", type: "Mall" }
    ],
    featured: true,
    newLaunch: false,
    verified: true,
    listingStatus: "Ready to Move",
    status: "live",
    postedBy: "Builder",
    postedDate: "2026-05-28"
  },
  {
    id: "prop-4",
    title: "RERA Approved Residential Plot",
    description: "Invest in your future with this premium residential plot located in a fast-appreciating avenue of Greater Noida West. This plot is 100% RERA approved, completely clear title, and part of a luxury secured gated township featuring 30ft wide internal concrete roads, boundary wall, green parks, and modern sewage structures. Highly lucrative for self-construction or investment growth. Exceptional connectivity to NH-24 and Noida main sectors.",
    price: 2800000,
    priceString: "₹28 Lakhs",
    location: "Sector 2, Greater Noida West",
    locality: "Greater Noida West",
    city: "Greater Noida West",
    type: "Plot",
    category: "Plots",
    bhk: null,
    area: 100,
    areaUnit: "sqyd",
    floor: "N/A",
    facing: "North",
    ageOfProperty: "New Launch",
    furnishing: "Unfurnished",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Security", "Power Backup", "Water Supply", "Garden"],
    landmarks: [
      { name: "Gaur City Mall", type: "Mall" },
      { name: "Yatharth Hospital", type: "Hospital" },
      { name: "DPS Greater Noida", type: "School" }
    ],
    featured: false,
    newLaunch: true,
    verified: true,
    listingStatus: "New Launch",
    status: "live",
    postedBy: "Builder",
    postedDate: "2026-06-08"
  },
  {
    id: "prop-5",
    title: "Luxury 4 BHK Sovereign Villa",
    description: "An architectural masterpiece in the heart of Millennium City. This bespoke under-construction 4 BHK luxury villa offers double-height lounge ceilings, an ultra-modern private plunge pool, and expansive landscaped rooftop decks. Perfectly finished with high-end fixtures, internal marble architecture, triple-tier intelligent home automation, and dedicated rooms for domestic staff. Set inside a highly secure premier township in Gurugram Sector 57, offering deep tranquility alongside instant access to Sector 56 Metro and Golf Course Road.",
    price: 28000000,
    priceString: "₹2.8 Crore",
    location: "Sovereign Enclave, Sector 57, Gurugram",
    locality: "Gurugram Sector 57",
    city: "Gurugram",
    type: "Villa",
    category: "Buy",
    bhk: 4,
    area: 3200,
    areaUnit: "sqft",
    floor: "3 Floors",
    facing: "East",
    ageOfProperty: "Under Construction",
    furnishing: "Semi-Furnished",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Parking", "Security", "Gym", "Power Backup", "Water Supply", "Garden", "Club House"],
    landmarks: [
      { name: "Sector 56 Rapid Metro", type: "Metro Station" },
      { name: "Ardee Mall", type: "Mall" },
      { name: "W Pratiksha Hospital", type: "Hospital" },
      { name: "Indira Gandhi International Airport", type: "Airport" }
    ],
    featured: true,
    newLaunch: true,
    verified: true,
    listingStatus: "Under Construction",
    status: "live",
    postedBy: "Builder",
    postedDate: "2026-06-03"
  },
  {
    id: "prop-6",
    title: "Elegant 2 BHK High-Rise Flat",
    description: "An elegant, highly affordable 2 BHK apartment designed for optimal space utilization. Strategically located right on Neharpar bypass road in Faridabad Sector 86. This flat offers gorgeous panoramic views of the landscaped central parks from its double-balconies. Complete with high-quality tile work, a semi-modular layout kitchen, and complete safety grills. Secured society living with CCTV monitoring, designated children's slides/playgrounds, and highly affordable maintenance. Excellent choice for nuclear families and salary professionals.",
    price: 3800000,
    priceString: "₹38 Lakhs",
    location: "Greenwood Society, Sector 86, Faridabad",
    locality: "Faridabad Sector 86",
    city: "Faridabad",
    type: "Flat",
    category: "Buy",
    bhk: 2,
    area: 850,
    areaUnit: "sqft",
    floor: "3rd",
    facing: "South-West",
    ageOfProperty: "3 Years",
    furnishing: "Semi-Furnished",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Parking", "Lift", "Security", "Power Backup", "Water Supply", "Garden"],
    landmarks: [
      { name: "Bata Chowk Metro Station", type: "Metro Station" },
      { name: "Modern Public School", type: "School" },
      { name: "Fortis Escorts Hospital", type: "Hospital" }
    ],
    featured: false,
    newLaunch: false,
    verified: true,
    listingStatus: "Ready to Move",
    status: "live",
    postedBy: "Agent",
    postedDate: "2026-05-15"
  },
  {
    id: "prop-7",
    title: "Corporate 1 BHK Studio Apartment",
    description: "Indulge in a premium, ultra-convenient high-life lifestyle right next to Delhi's prestigious hospitality hub, Aerocity. This modern 1 BHK Studio Apartment is designed carefully with smart spaces, perfect soundproof dual-glazed windows to block runway noise, beautiful premium granite kitchen, and false ceilings. Enjoys 24-hr multi-level manned gate security, luxury lobby, and close walking access to Worldmark Food corridors and the Delhi Airport Metro line. Perfect high-demand asset for corporate delegates and frequent flyers.",
    price: 4200000,
    priceString: "₹42 Lakhs",
    location: "Aerocity Heights, Aerocity, New Delhi",
    locality: "Aerocity",
    city: "Aerocity",
    type: "Flat",
    category: "Rent",
    bhk: 1,
    area: 620,
    areaUnit: "sqft",
    floor: "8th",
    facing: "East",
    ageOfProperty: "4 Years",
    furnishing: "Fully Furnished",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Parking", "Lift", "Security", "Gym", "Power Backup", "Water Supply", "Club House"],
    landmarks: [
      { name: "Aerocity Metro Station", type: "Metro Station" },
      { name: "IGI Airport Terminal 3", type: "Airport" },
      { name: "Worldmark Aerocity", type: "Mall" }
    ],
    featured: false,
    newLaunch: false,
    verified: true,
    listingStatus: "Ready to Move",
    status: "live",
    postedBy: "Agent",
    postedDate: "2026-05-20"
  },
  {
    id: "prop-8",
    title: "Elegant 3 BHK Builder Floor",
    description: "Ultra-modern freehold builder floor in a upscale residential sector of Rohini. Crafted with beautiful high-end stone elevation, modern semi-modular kitchen cabinetry, double-size bedrooms and high-grade anti-skid wardrobes. Comes with high-strength structural pillars, private stilt parking space, single point electrical wiring and separate drinking water connection. Enjoys great location proximity to direct public transport and local parks.",
    price: 7200000,
    priceString: "₹72 Lakhs",
    location: "Sector 24, Rohini, New Delhi",
    locality: "Rohini Sector 24",
    city: "Rohini",
    type: "Builder Floor",
    category: "Buy",
    bhk: 3,
    area: 1200,
    areaUnit: "sqft",
    floor: "1st",
    facing: "North-West",
    ageOfProperty: "Under 1 Year",
    furnishing: "Semi-Furnished",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["Parking", "Security", "Water Supply", "Garden"],
    landmarks: [
      { name: "Rithala Metro Station", type: "Metro Station" },
      { name: "Dr. Baba Saheb Ambedkar Hospital", type: "Hospital" },
      { name: "Metro Walk Rohini", type: "Mall" }
    ],
    featured: false,
    newLaunch: false,
    verified: true,
    listingStatus: "Ready to Move",
    status: "live",
    postedBy: "Agent",
    postedDate: "2026-06-04"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    clientName: "Rajesh Kumar",
    location: "Dwarka, Delhi",
    rating: 5,
    reviewText: "Shiv Saya Properties guided me through purchasing my first ever home in Dwarka Sector 10. Outstanding professional ethics, completely transparent RERA details, and zero hidden costs. Highly recommend!",
    propertyType: "3 BHK Apartment"
  },
  {
    id: "t-2",
    clientName: "Meenakshi Sharma",
    location: "Gurugram",
    rating: 5,
    reviewText: "Excellent command over the local Gurugram market. They helped me compare builder track records and secure a fantastic deal on our luxury sector 57 villa. Exceptional paperwork support.",
    propertyType: "4 BHK Sovereign Villa"
  },
  {
    id: "t-3",
    clientName: "Anil Sethi",
    location: "Noida Sector 18",
    rating: 5,
    reviewText: "I was looking for a high-occupancy commercial investment in Noida Sector 18. Their advisory team identified a ground floor shop that is already yielding incredible rents. Pure professionals.",
    propertyType: "Commercial Retail Shop"
  }
];

export const SERVICES = [
  { id: "s-1", title: "Residential Properties", description: "Explore premium Apartments, luxury villas, and private builder floors across prime neighborhoods." },
  { id: "s-2", title: "Commercial Properties", description: "Invest in high-footfall retail shops, Grade-A office spaces, and commercial showrooms." },
  { id: "s-3", title: "Rental Solutions", description: "Hassle-free corporate rentals, family apartments, and luxury stays with strict agreement verification." },
  { id: "s-4", title: "Investment Advisory", description: "Maximize your portfolio with RERA approved, high-growth prospective markets in Delhi NCR." },
  { id: "s-5", title: "Builder Floors", description: "Secure modern independent floor properties with private staircases, stilt parking, and premium building." },
  { id: "s-6", title: "Plots & Land", description: "Invest in freehold residential or industrial plots inside secure gated residential societies." },
  { id: "s-7", title: "Property Documentation", description: "End-to-end guidance through title deed registry, conversion certificates, RERA forms, and sales deeds." },
  { id: "s-8", title: "Property Valuation", description: "Accurate comparative market analysis of your land, apartment, or commercial setups." },
  { id: "s-9", title: "Home Loan Assistance", description: "Fast-track documentation for bank loans matching with India's leading banks at the lowest interest rates." }
];

export const WHY_CHOOSE_US = [
  { id: "w-1", iconName: "Map", title: "Local Market Experts", description: "With 10+ years of micro-market data across Delhi, Gurugram, and Noida, we know how to secure the best pricing for you." },
  { id: "w-2", iconName: "BadgeCheck", title: "Verified Listings Only", description: "No false listings. Every listing on our platform undergoes a rigorous physical and legal ownership check by our team." },
  { id: "w-3", iconName: "Shield", title: "End-to-End Support", description: "From initial high-definition viewings to final key handovers, registry documentation, and bank loans — we cover it all." },
  { id: "w-4", iconName: "FileText", title: "RERA Registered & Transparent", description: "100% compliant with Delhi and Haryana RERA laws. Our advisory is fully ethical, contractually defined, and transparent." }
];

export const COVERED_AREAS = [
  "Gurugram",
  "Noida",
  "Greater Noida West",
  "South Delhi",
  "Dwarka",
  "Aerocity",
  "Faridabad",
  "Ghaziabad",
  "Rohini",
  "Pitampura",
  "Vasant Kunj",
  "Saket"
];
