process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgres://crm:crm@127.0.0.1:55432/crm_test";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-change-me";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-change-me";
process.env.COOKIE_SECRET ??= "test-cookie-secret-change-me";
process.env.CORS_ORIGIN ??= "http://localhost:5173";
process.env.DEV_ADMIN_EMAIL ??= "admin@demo.local";
process.env.DEV_ADMIN_PASSWORD ??= "Admin123!demo";
