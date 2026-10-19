import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG, THRESHOLDS } from '../config.js';

export const options = {
    vus: 5,
    duration: '20s',
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<300'],
    },
};

export default function () {
    // 1. Fetch stays catalog
    const staysRes = http.get(`${CONFIG.baseUrl}/api/v1/stays`, { headers: CONFIG.headers });
    check(staysRes, {
        'stays status is 200': (r) => r.status === 200,
        'stays payload has data': (r) => {
            try {
                const body = JSON.parse(r.body);
                return Array.isArray(body.data) && body.data.length > 0;
            } catch (_) {
                return false;
            }
        },
    });

    sleep(0.5);

    // 2. Fetch single stay detail
    const stayDetailRes = http.get(`${CONFIG.baseUrl}/api/v1/stays/tawila-island-sunset-lagoon-villa`, { headers: CONFIG.headers });
    check(stayDetailRes, {
        'stay detail status is 200': (r) => r.status === 200,
    });

    sleep(0.5);

    // 3. Fetch experiences catalog
    const expRes = http.get(`${CONFIG.baseUrl}/api/v1/experiences`, { headers: CONFIG.headers });
    check(expRes, {
        'experiences status is 200': (r) => r.status === 200,
    });

    sleep(0.5);

    // 4. Calculate quote
    const quotePayload = JSON.stringify({
        property_id: 6,
        check_in: '2026-11-15',
        check_out: '2026-11-19',
        guests: 4,
    });

    const quoteRes = http.post(`${CONFIG.baseUrl}/api/v1/checkout/quote`, quotePayload, { headers: CONFIG.headers });
    check(quoteRes, {
        'quote status is 200': (r) => r.status === 200,
    });

    sleep(1);
}
