/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModerationStatus = "live" | "pending" | "rejected";
export type AvailabilityStatus = "Ready to Move" | "Under Construction" | "New Launch";
export type City = "Gurugram" | "Noida" | "Greater Noida West" | "Delhi" | "Faridabad" | "Ghaziabad";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // in Rupees, e.g. 8500000 for 85 Lakhs
    location: string;
  locality: string; // e.g. "Dwarka Sector 10" or "Noida Sector 18"
  city: City;
  type: "Flat" | "Villa" | "Plot" | "Builder Floor" | "Commercial" | string;
  category: "Buy" | "Rent" | "Commercial" | "Plots" | string;
  bhk: number | null; // e.g. 3, or null for commercial/plot
  area: number; // in sqft or sqyd
  areaUnit: "sqft" | "sqyd" | string;
  floor: string | number; // e.g. "5th" or "Ground Floor" or "1st"
  facing?: string; // e.g. "North-East"
  ageOfProperty?: string; // e.g. "2 Years" or "New Launch"
  furnishing?: "Unfurnished" | "Semi-Furnished" | "Fully Furnished" | string;
  images: string[];
  amenities: string[];
  landmarks?: { name: string; type: string }[];
  featured: boolean;
  newLaunch: boolean;
  verified: boolean;
  moderationStatus?: ModerationStatus;
  availabilityStatus?: AvailabilityStatus;
  postedDate: string;
  postedBy: "Owner" | "Builder" | "Agent";
  customPostedBy?: string;
  bathrooms?: number;
  totalFloors?: number;
  possession?: string;
  reraApproved?: boolean;
  isPremium?: boolean;
  transactionType?: "Buy" | "Rent";
  createdAt?: string;
  postedByUid?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  rejectionReason?: string;
  auditLog?: { action: string; reason: string; timestamp: string; user: string }[];
  videoUrl?: string;
  imageUrls?: string[];
}

export interface Testimonial {
  id: string;
  clientName: string;
  location: string;
  rating: number;
  reviewText: string;
  propertyType: string;
}

export interface Enquiry {
  id?: string;
  name: string;
  phone: string;
  message: string;
  propertyId: string;
  propertyName: string;
  dateStr?: string;
  type: "enquiry" | "visit";
  userId?: string;
  userEmail?: string;
}

export interface SearchFilters {
  location: string; // Empty string for "All"
  type: string; // Empty string for "All"
  budgetMin: number;
  budgetMax: number;
  bhk: string; // "All", "1", "2", "3", "4+"
}

export interface ListingFilters {
  locations: string[]; // Selected cities
  types: string[]; // Selected types
  budgetMax: number;
  bhks: string[]; // Selected BHK options
  statuses: string[];
  postedBy: string[];
}

export type View = "home" | "properties" | "saved" | "list_property" | "profile" | "admin" | string;

export type AdminTab = "overview" | "properties" | "pending_approvals" | "enquiries" | "users" | "analytics" | "settings" | "checklist";

export interface EnquiryRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyName: string;
  message: string;
  dateStr: string;
  status: "New" | "Contacted" | "Resolved";
}

export interface AdminSettings {
  businessName: string;
  whatsappNumber: string;
  businessEmail: string;
  reraNumber: string;
  businessAddress: string;
  consultantName: string;
  businessPhone: string;
}

