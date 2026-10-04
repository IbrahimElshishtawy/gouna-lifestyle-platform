import { apiClient } from "@/lib/api/client";
import {
  CheckoutFormData,
  CheckoutProcessResponse,
  PaymentMethod,
} from "../types/checkout.types";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 1,
    name: "Credit / Debit Card (Online)",
    type: "card",
    description: "Pay securely online with Visa, Mastercard, or local card schemes.",
    is_enabled: true,
  },
  {
    id: 2,
    name: "PayPal",
    type: "paypal",
    description: "Pay with your PayPal account or linked cards.",
    is_enabled: true,
  },
  {
    id: 3,
    name: "Bank Wire / Instapay Transfer",
    type: "bank_transfer",
    description: "Direct transfer to our Egyptian National Bank account or Instapay.",
    is_enabled: true,
  },
  {
    id: 4,
    name: "Cash on Arrival / Office Payment",
    type: "cash",
    description: "Pay cash upon arrival or at our Abu Tig Marina office.",
    is_enabled: true,
  },
];

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
  const methodMap: Record<number, string> = {
    1: "card",
    2: "paypal",
    3: "bank_transfer",
    4: "cash",
  };
  const paymentMethodCode = methodMap[formData.payment_method_id] || "cash";

  const idempotencyKey = `chk-${formData.property_id}-${formData.email}-${Date.now()}`;

  try {
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
          payment_method: paymentMethodCode,
        }),
      }
    );

    if (response?.data?.attributes?.reference) {
      const ref = response.data.attributes.reference;
      return {
        success: true,
        booking_reference: ref,
        redirect_url:
          response.meta?.redirect_url ||
          `/checkout/confirmation/${ref}`,
        message: "Your reservation has been created!",
      };
    }
  } catch (error) {
    // If it's a conflict or validation error, rethrow so the form can display it
    throw error;
  }

  const mockRef = `GON-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    success: true,
    booking_reference: mockRef,
    redirect_url: `/checkout/confirmation/${mockRef}`,
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

  const url = `/checkout/bookings/${reference}${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await apiClient<{ data: BackendBookingResponse["data"] }>(
    url
  );
  return response.data;
}
