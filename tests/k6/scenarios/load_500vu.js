import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { CONFIG, THRESHOLDS } from '../config.js';

// Custom metrics
const readLatency = new Trend('read_duration_ms');
const writeLatency = new Trend('write_duration_ms');
const errorRate = new Rate('custom_error_rate');

export const options = {
    stages: [
        { duration: '30s', target: 50 },   // Warm up to 50 VUs
        { duration: '1m', target: 200 },   // Ramp to 200 VUs
        { duration: '1m', target: 500 },   // Ramp to target peak: 500 VUs
        { duration: '2m', target: 500 },   // Sustain 500 concurrent VUs
        { duration: '30s', target: 0 },    // Ramp down
    ],
    thresholds: {
        'http_req_failed': ['rate<0.01'],
        'http_req_duration': ['p(95)<400', 'p(99)<800'],
        'read_duration_ms': ['p(95)<300'],
        'write_duration_ms': ['p(95)<500'],
    },
};

export default function () {
    const userRoleRand = Math.random();

    // 1. 60% Anonymous Browsers
    if (userRoleRand < 0.60) {
        group('Catalog Browsing', function () {
            const page = Math.floor(Math.random() * 3) + 1;
            const start = Date.now();
            const res = http.get(`${CONFIG.baseUrl}/api/v1/stays?page=${page}&limit=12`, { headers: CONFIG.headers });
            readLatency.add(Date.now() - start);

            const ok = check(res, {
                'browse catalog 200': (r) => r.status === 200,
            });
            if (!ok) errorRate.add(1);
        });

        sleep(Math.random() * 2 + 1);
    }
    // 2. 30% High-Intent Property Searchers
    else if (userRoleRand < 0.90) {
        group('Property Detail & Availability', function () {
            const start1 = Date.now();
            const detailRes = http.get(`${CONFIG.baseUrl}/api/v1/stays/tawila-island-sunset-lagoon-villa`, { headers: CONFIG.headers });
            readLatency.add(Date.now() - start1);

            check(detailRes, {
                'detail 200': (r) => r.status === 200,
            });

            sleep(0.5);

            const availPayload = JSON.stringify({
                check_in: '2026-11-20',
                check_out: '2026-11-23',
                guests: 2,
            });

            const start2 = Date.now();
            const availRes = http.post(`${CONFIG.baseUrl}/api/v1/stays/tawila-island-sunset-lagoon-villa/check-availability`, availPayload, { headers: CONFIG.headers });
            readLatency.add(Date.now() - start2);

            const ok = check(availRes, {
                'check availability 200': (r) => r.status === 200,
            });
            if (!ok) errorRate.add(1);
        });

        sleep(Math.random() * 2 + 1);
    }
    // 3. 10% Booking Checkout Transactions
    else {
        group('Quote & Booking Transaction', function () {
            const quotePayload = JSON.stringify({
                property_id: 6,
                check_in: '2026-12-01',
                check_out: '2026-12-04',
                guests: 4,
            });

            const start = Date.now();
            const quoteRes = http.post(`${CONFIG.baseUrl}/api/v1/checkout/quote`, quotePayload, { headers: CONFIG.headers });
            writeLatency.add(Date.now() - start);

            const ok = check(quoteRes, {
                'quote status 200': (r) => r.status === 200,
            });
            if (!ok) errorRate.add(1);
        });

        sleep(Math.random() * 3 + 2);
    }
}
