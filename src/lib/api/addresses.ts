/**
 * The signed-in shopper's address book.
 *
 * Checkout reads from here rather than keeping its own copy of an address:
 * an address entered once during checkout should still be there next time,
 * and one edited in the account should be the one checkout offers.
 */

import { http } from "./client";

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

/** The fields the API accepts when creating or updating an address. */
export interface AddressInput {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export async function listAddresses(): Promise<Address[]> {
  return (await http.get<Address[] | null>("/addresses")) ?? [];
}

export function createAddress(input: AddressInput): Promise<Address> {
  return http.post<Address>("/addresses", input);
}

export function updateAddress(
  id: string,
  input: AddressInput
): Promise<Address> {
  return http.put<Address>(`/addresses/${encodeURIComponent(id)}`, input);
}

export function deleteAddress(id: string): Promise<void> {
  return http.delete<void>(`/addresses/${encodeURIComponent(id)}`);
}

export function setDefaultAddress(id: string): Promise<Address> {
  return http.put<Address>(
    `/addresses/${encodeURIComponent(id)}/default`,
    undefined
  );
}

/**
 * The address fields checkout requires, in the order the backend validates
 * them. Used to decide whether a saved address can be shipped to as-is.
 */
export function isDeliverable(address: Partial<Address>): boolean {
  return Boolean(
    address.street?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.zipCode?.trim() &&
      address.country?.trim()
  );
}

/** One-line rendering of an address, for summaries and confirmations. */
export function formatAddress(address: Partial<Address>): string {
  return [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}
