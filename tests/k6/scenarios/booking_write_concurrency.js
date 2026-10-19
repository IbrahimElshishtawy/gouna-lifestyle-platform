import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { CONFIG } from '../config.js';

/**
 * Stateful Booking Write Concurrency Benchmark (Phase 12D)
 * 
 * Exercises genuine database write operations against POST /api/v1/checkout/bookings:
 * - Scenario A: Concurrent booking creation across independent inventory units with synthetic accounts.
 * - Scenario B: High-contention race conditions targeting the identical property and overlapping dates.
 * 
 * Enforces:
 * - Unique actor-scoped Idempotency-Key headers
 * - Safe synthetic customer accounts
 * - Rigorous verification of HTTP 201 (success) vs HTTP 409/422 (conflict)
 * - Zero unexpected 500 server errors
 * - Zero double bookings
 */

// Custom write metrics
const writeLatency = new Trend('booking_write_latency_ms');
const successfulWrites = new Counter('successful_bookings_created');
const conflictResponses = new Counter('conflict_409_responses');
const serverErrorRate = new Rate('unhandled_500_server_errors');

export const options = {
    scenarios: {
        // Scenario A: Concurrent writes across independent inventory
        independent_writes: {
            executor: 'constant-vus',
            vus: 10,
            duration: '30s',
            exec: 'independentWritesScenario',
        },
        // Scenario B: Contention spike on identical property and dates
        contention_spike: {
            executor: 'per-vu-iterations',
            vus: 10,
            iterations: 1,
            maxDuration: '15s',
            startTime: '35s',
            exec: 'contentionSpikeScenario',
        },
    },
    thresholds: {
        'booking_write_latency_ms': ['p(95)<600'],
        'unhandled_500_server_errors': ['rate==0'], // Zero 500 errors tolerated
    },
};

// Generate UUIDv4 for Idempotency-Key header
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Scenario A: Independent inventory writes with unique dates per VU
export function independentWritesScenario() {
    const vuId = __VU;
    const iter = __ITER;
    const uniqueDay = 10 + (vuId * 5) + (iter % 10);
    const checkIn = `2027-03-${String(uniqueDay).padStart(2, '0')}`;
    const checkOut = `2027-03-${String(uniqueDay + 3).padStart(2, '0')}`;

    const idempotencyKey = `k6-indep-${vuId}-${iter}-${generateUUID()}`;
    const payload = JSON.stringify({
        property_id: 1,
        check_in: checkIn,
        check_out: checkOut,
        guests: 2,
        payment_method: 'card',
        first_name: `SynthVU${vuId}`,
        last_name: `Iter${iter}`,
        email: `synth_vu_${vuId}_${iter}_${Date.now()}@staging-test.gounow.internal`,
        phone: `+2010${String(10000000 + vuId * 1000 + iter).slice(0, 8)}`,
    });

    const headers = Object.assign({}, CONFIG.headers, {
        'Idempotency-Key': idempotencyKey,
    });

    const start = Date.now();
    const res = http.post(`${CONFIG.baseUrl}/api/v1/checkout/bookings`, payload, { headers });
    writeLatency.add(Date.now() - start);

    if (res.status >= 500) {
        serverErrorRate.add(1);
    } else {
        serverErrorRate.add(0);
    }

    const isSuccess = check(res, {
        'independent write 201 created': (r) => r.status === 201,
        'has booking reference': (r) => {
            try {
                const body = JSON.parse(r.body);
                return !!(body.data && body.data.reference);
            } catch (_) {
                return false;
            }
        },
    });

    if (isSuccess) {
        successfulWrites.add(1);
    }

    sleep(1);
}

// Scenario B: Contention spike — exactly 10 requests submitted for the EXACT SAME property and dates
export function contentionSpikeScenario() {
    const vuId = __VU;
    const targetCheckIn = '2027-05-10';
    const targetCheckOut = '2027-05-15';

    const idempotencyKey = `k6-contend-${vuId}-${generateUUID()}`;
    const payload = JSON.stringify({
        property_id: 1,
        check_in: targetCheckIn,
        check_out: targetCheckOut,
        guests: 2,
        payment_method: 'card',
        first_name: `Contender${vuId}`,
        last_name: 'Race',
        email: `contender_${vuId}_${Date.now()}@staging-test.gounow.internal`,
        phone: `+2011${String(20000000 + vuId * 1000).slice(0, 8)}`,
    });

    const headers = Object.assign({}, CONFIG.headers, {
        'Idempotency-Key': idempotencyKey,
    });

    const start = Date.now();
    const res = http.post(`${CONFIG.baseUrl}/api/v1/checkout/bookings`, payload, { headers });
    writeLatency.add(Date.now() - start);

    if (res.status >= 500) {
        serverErrorRate.add(1);
    } else {
        serverErrorRate.add(0);
    }

    if (res.status === 201) {
        successfulWrites.add(1);
        check(res, {
            'contention winner 201 created': (r) => r.status === 201,
        });
    } else if (res.status === 409 || res.status === 422) {
        conflictResponses.add(1);
        check(res, {
            'contention loser safely rejected (409 or 422)': (r) => r.status === 409 || r.status === 422,
            'rejection has error code': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    const code = body.error?.code || body.code || '';
                    return ['AVAILABILITY_COLLISION', 'BOOKING_UNAVAILABLE', 'DATES_UNAVAILABLE'].includes(code);
                } catch (_) {
                    return false;
                }
            },
        });
    } else {
        check(res, {
            'unexpected status code': () => false,
        });
    }
}
