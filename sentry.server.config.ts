import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://6b15eeba595cc4e49e27070060bd234d@o4510866637258752.ingest.de.sentry.io/4510866638766160",

  // Capture 100% in dev, 10% in production
  // Adjust based on your traffic volume
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,
});
