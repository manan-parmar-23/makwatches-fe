/** Account, profile and preferences for the signed-in user. */

import { http } from "./client";
import type { User } from "./types";

/** The signed-in user, derived from the bearer token. */
export function getCurrentUser(): Promise<User> {
  return http.get<User>("/me");
}

export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  /** Present only once the customer has filled in a profile. */
  phone?: string;
  gender?: string;
  dateOfBirth?: string | null;
  avatarUrl?: string;
  bio?: string;
}

export interface AccountOverview {
  profile: AccountProfile;
  counts: { wishlist: number; orders: number; reviews: number };
}

/** Aggregated account landing data: who they are, and how much of each thing. */
export function getAccountOverview(): Promise<AccountOverview> {
  return http.get<AccountOverview>("/account/overview");
}

/** The fields a customer may change about themselves. */
export interface ProfileInput {
  phone?: string;
  gender?: string;
  dateOfBirth?: string | null;
  bio?: string;
}

export function getProfile(): Promise<AccountProfile> {
  return http.get<AccountProfile>("/profiles/");
}

export function updateProfile(profile: ProfileInput): Promise<AccountProfile> {
  return http.put<AccountProfile>("/profiles/", profile);
}

export interface Preferences {
  favoriteCategories?: string[];
  favoriteBrands?: string[];
  sizePreferences?: Record<string, string>;
}

export function updatePreferences(preferences: Preferences): Promise<void> {
  return http.put<void>("/preferences/", preferences);
}

export interface AccountReview {
  id: string;
  productId: string;
  productName?: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
}

export async function listReviews(): Promise<AccountReview[]> {
  return (await http.get<AccountReview[] | null>("/account/reviews")) ?? [];
}

export function deleteReview(id: string): Promise<void> {
  return http.delete<void>(`/account/reviews/${encodeURIComponent(id)}`);
}
