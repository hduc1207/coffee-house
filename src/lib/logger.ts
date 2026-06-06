import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
    base: { app: "coffee-house" },
    redact: {
        paths: [
            "password",
            "currentPassword",
            "newPassword",
            "*.password",
            "*.currentPassword",
            "*.newPassword",
            "*.token",
            "*.access_token",
            "*.refresh_token",
            "headers.authorization",
            "headers.cookie",
        ],
        censor: "[REDACTED]",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: isDev
        ? {
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "HH:MM:ss.l",
                  ignore: "pid,hostname,app",
                  singleLine: false,
               },
          }
        : undefined,
});
