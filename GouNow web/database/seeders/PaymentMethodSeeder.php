<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Credit / Debit Card (Online)',
                'code' => 'card',
                'description' => 'Pay securely online with Visa, Mastercard, or local card schemes.',
                'logo' => '/assets/icons/card.svg',
                'is_enabled' => true,
                'is_online' => true,
                'gateway_driver' => 'CardGateway',
                'test_mode' => true,
                'configuration' => [
                    'public_key' => 'pk_test_placeholder_key',
                    'secret_key' => 'sk_test_placeholder_secret',
                    'webhook_secret' => 'whsec_placeholder',
                ],
                'instructions_en' => 'You will be redirected to complete your secure payment.',
                'instructions_ar' => 'سيتم توجيهك لإتمام الدفع الإلكتروني الآمن بواسطة بطاقتك الائتمانية.',
                'transaction_fee_percentage' => 2.50,
                'transaction_fee_fixed_cents' => 0,
                'supported_currencies' => ['EGP', 'USD', 'EUR', 'GBP'],
                'sort_order' => 1,
            ],
            [
                'name' => 'PayPal',
                'code' => 'paypal',
                'description' => 'Pay with your PayPal account or linked cards.',
                'logo' => '/assets/icons/paypal.svg',
                'is_enabled' => true,
                'is_online' => true,
                'gateway_driver' => 'PayPalGateway',
                'test_mode' => true,
                'configuration' => [
                    'client_id' => 'client_id_placeholder',
                    'secret' => 'client_secret_placeholder',
                ],
                'instructions_en' => 'You will be redirected to PayPal to complete your payment.',
                'instructions_ar' => 'سيتم توجيهك إلى منصة PayPal لإتمام عملية الدفع.',
                'transaction_fee_percentage' => 3.50,
                'transaction_fee_fixed_cents' => 0,
                'supported_currencies' => ['USD', 'EUR', 'GBP'],
                'sort_order' => 2,
            ],
            [
                'name' => 'Bank Wire / Instapay Transfer',
                'code' => 'bank_transfer',
                'description' => 'Direct transfer to our Egyptian National Bank account or Instapay.',
                'logo' => '/assets/icons/bank.svg',
                'is_enabled' => true,
                'is_online' => false,
                'gateway_driver' => 'ManualBankTransferGateway',
                'test_mode' => false,
                'configuration' => [
                    'bank_name' => 'Commercial International Bank (CIB) - El Gouna Branch',
                    'account_name' => 'GOUNOW LIFESTYLE & REAL ESTATE LLC',
                    'account_number' => '1000-4829-9182-01',
                    'iban' => 'EG450010004829918201000000',
                    'swift_code' => 'CIBEEGCX',
                    'instapay_handle' => 'gounow@cib',
                ],
                'instructions_en' => 'Please transfer the total amount within 24 hours and upload or WhatsApp the transfer receipt with your booking reference.',
                'instructions_ar' => 'يرجى تحويل المبلغ خلال 24 ساعة وإرسال إيصال التحويل مع رقم الحجز عبر الواتساب لتأكيد الحجز فوراً.',
                'transaction_fee_percentage' => 0,
                'transaction_fee_fixed_cents' => 0,
                'supported_currencies' => ['EGP', 'USD', 'EUR'],
                'sort_order' => 3,
            ],
            [
                'name' => 'Cash on Arrival / Office Payment',
                'code' => 'cash',
                'description' => 'Pay cash upon arrival or at our Abu Tig Marina office.',
                'logo' => '/assets/icons/cash.svg',
                'is_enabled' => true,
                'is_online' => false,
                'gateway_driver' => 'ManualCashGateway',
                'test_mode' => false,
                'configuration' => [
                    'office_address' => 'Abu Tig Marina, Building 14, El Gouna',
                ],
                'instructions_en' => 'You can pay in cash upon check-in or visit our office at Abu Tig Marina. Valid ID or passport required.',
                'instructions_ar' => 'يمكنك سداد المبلغ نقداً عند الوصول أو بمقر مكتبنا بمارينا أبو تيج. يرجى إحضار إثبات الهوية أو جواز السفر.',
                'transaction_fee_percentage' => 0,
                'transaction_fee_fixed_cents' => 0,
                'supported_currencies' => ['EGP', 'USD', 'EUR'],
                'sort_order' => 4,
            ],
        ];

        foreach ($methods as $m) {
            PaymentMethod::updateOrCreate(['code' => $m['code']], $m);
        }
    }
}
