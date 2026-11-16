export interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  description: string;
  is_online: boolean;
  instructions?: string;
  instructions_en?: string;
  instructions_ar?: string;
  supported_currencies?: string[];
  configuration?: Record<string, string> | null;
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
  payment_method: string;
}

export interface CheckoutProcessResponse {
  success: boolean;
  booking_reference?: string;
  redirect_url?: string;
  message?: string;
}
