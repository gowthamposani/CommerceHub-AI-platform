import { unwrapApiResponse } from "./client";
import { http } from "./http";
import type { ApiEnvelope } from "../types/api";
import type {
  Address,
  AddressCreatePayload,
  AddressUpdatePayload,
  CustomerProfile,
  CustomerProfileUpdatePayload
} from "../types/domain";

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return unwrapApiResponse(http.get<ApiEnvelope<CustomerProfile>>("/customer/profile"));
}

export async function updateCustomerProfile(payload: CustomerProfileUpdatePayload): Promise<CustomerProfile> {
  return unwrapApiResponse(http.put<ApiEnvelope<CustomerProfile>>("/customer/profile", payload));
}

export async function listCustomerAddresses(): Promise<Address[]> {
  return unwrapApiResponse(http.get<ApiEnvelope<Address[]>>("/customer/addresses"));
}

export async function createCustomerAddress(payload: AddressCreatePayload): Promise<Address> {
  return unwrapApiResponse(http.post<ApiEnvelope<Address>>("/customer/addresses", payload));
}

export async function updateCustomerAddress(addressId: string, payload: AddressUpdatePayload): Promise<Address> {
  return unwrapApiResponse(http.put<ApiEnvelope<Address>>(`/customer/addresses/${addressId}`, payload));
}

export async function deleteCustomerAddress(addressId: string): Promise<void> {
  await unwrapApiResponse(http.delete<ApiEnvelope<Record<string, never>>>(`/customer/addresses/${addressId}`));
}

export async function setDefaultCustomerAddress(addressId: string): Promise<Address> {
  return unwrapApiResponse(http.patch<ApiEnvelope<Address>>(`/customer/addresses/${addressId}/default`));
}
