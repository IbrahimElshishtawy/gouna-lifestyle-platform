export interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  description: string;
  is_enabled: boolean;
}

export interface CheckoutFormData {
  property_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  promo_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  special_requests?: string;
  payment_type: "full" | "deposit";
  payment_method_id: number;
}

export interface CheckoutProcessResponse {
  success: boolean;
  booking_reference?: string;
  redirect_url?: string;
  message?: string;
}
