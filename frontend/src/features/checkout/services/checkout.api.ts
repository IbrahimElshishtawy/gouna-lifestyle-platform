import { apiClient } from "@/lib/api/client";
import {
  CheckoutFormData,
  CheckoutProcessResponse,
  PaymentMethod,
} from "../types/checkout.types";

interface BackendBookingResponse {
  data: {
    id: number;
    type: string;
    attributes: {
      reference: string;
      status: string;
      payment_status: string;
      check_in: string;
      check_out: string;
      nights: number;
      guests: number;
      pricing: {
        total_cents: number;
        deposit_cents: number;
        currency: string;
      };
    };
  };
  meta?: {
    request_id?: string;
    payment_result?: {
      transaction_id?: string;
      redirect_url?: string | null;
      amount_cents?: number;
      currency?: string;
    };
    redirect_url?: string | null;
    access_token?: string | null;
  };
}

export async function processCheckout(
  formData: CheckoutFormData
): Promise<CheckoutProcessResponse> {
  const idempotencyKey = `chk-${formData.property_id}-${formData.email}-${Date.now()}`;

  const response = await apiClient<BackendBookingResponse>(
    "/checkout/bookings",
    {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        property_id: formData.property_id,
        check_in: formData.check_in,
        check_out: formData.check_out,
        guests: Number(formData.guests),
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        special_requests: formData.special_requests || undefined,
        promo_code: formData.promo_code || undefined,
        payment_method: formData.payment_method,
      }),
    }
  );

  const ref = response?.data?.attributes?.reference;
  if (!ref) {
    throw new Error("Booking creation did not return a valid booking reference.");
  }

  const token = response.meta?.access_token;
  return {
    success: true,
    booking_reference: ref,
    redirect_url: `/checkout/confirmation/${ref}${token ? `?token=${encodeURIComponent(token)}` : ""}`,
    message: "Your reservation has been created!",
  };
}

export async function getBookingByReference(
  reference: string,
  token?: string,
  email?: string
): Promise<BackendBookingResponse["data"] | null> {
  const query = new URLSearchParams();
  if (token) query.set("token", token);
  if (email) query.set("email", email);

  const url = `/checkout/bookings/${encodeURIComponent(reference)}${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await apiClient<{ data: BackendBookingResponse["data"] }>(
    url
  );
  return response.data;
}

export async function completePaymobPaymentApi(
  reference: string,
  data: {
    token?: string;
    session?: string;
    gateway_reference?: string;
    card_brand?: string;
    channel?: string;
  }
) {
  return apiClient<{
    success: boolean;
    status: string;
    booking_reference: string;
    redirect_url: string;
    message: string;
  }>(`/checkout/bookings/${encodeURIComponent(reference)}/paymob-complete`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function declinePaymobPaymentApi(
  reference: string,
  data?: {
    token?: string;
    reason?: string;
  }
) {
  return apiClient<{
    success: boolean;
    status: string;
    message: string;
  }>(`/checkout/bookings/${encodeURIComponent(reference)}/paymob-decline`, {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}

export interface PaymentProofData {
  id: number;
  status: "pending_verification" | "verified" | "rejected" | "cancelled";
  amount_cents: number;
  currency: string;
  payment_method_code: string;
  reference_number?: string;
  sender_name?: string;
  sender_account?: string;
  transfer_date?: string;
  rejection_reason?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface PaymentProofStatusResponse {
  booking_reference: string;
  booking_status: string;
  payment_status: string;
  proofs: PaymentProofData[];
}

export async function submitPaymentProofApi(
  reference: string,
  formData: FormData,
  token?: string
) {
  const url = `/checkout/bookings/${encodeURIComponent(reference)}/payment-proof${
    token ? `?token=${encodeURIComponent(token)}` : ""
  }`;

  return apiClient<{
    success: boolean;
    message: string;
    message_en: string;
    data: PaymentProofData;
  }>(url, {
    method: "POST",
    body: formData,
  });
}

export async function getPaymentProofStatusApi(
  reference: string,
  token?: string
): Promise<PaymentProofStatusResponse> {
  const url = `/checkout/bookings/${encodeURIComponent(reference)}/payment-proof${
    token ? `?token=${encodeURIComponent(token)}` : ""
  }`;

  return apiClient<PaymentProofStatusResponse>(url);
}

export async function fetchPaymentMethodsApi(): Promise<{ data: PaymentMethod[] }> {
  return apiClient<{ data: PaymentMethod[] }>("/payment-methods");
}
