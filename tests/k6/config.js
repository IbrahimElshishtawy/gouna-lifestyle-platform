export const CONFIG = {
    baseUrl: __ENV.TARGET_URL || 'http://127.0.0.1:8001',
    adminEmail: 'admin@gounow.com',
    adminPassword: 'Admin@2026!',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
};

export const THRESHOLDS = {
    http_req_failed: ['rate<0.01'], // < 1% error rate
    http_req_duration: ['p(95)<350', 'p(99)<750'], // 95% of requests must complete below 350ms
};
