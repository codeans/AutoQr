process.env.NODE_ENV = "test";
/** Isolate tests from CI/machine paths (e.g. Docker `/app/uploads`). */
process.env.UPLOAD_DIR = "uploads";
process.env.PORT = "4000";
process.env.MONGODB_URI = "mongodb://localhost:27017/autoqr_test";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test_access_secret_123456";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_123456";
process.env.PUBLIC_BASE_URL = "http://localhost:5173";
