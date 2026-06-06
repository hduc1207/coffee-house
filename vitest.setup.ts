Object.assign(process.env, { NODE_ENV: "test" });
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test-secret-must-be-at-least-32-characters-long";
