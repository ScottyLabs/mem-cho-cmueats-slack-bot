import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config(); // loads in .env file if present

const envSchema = z.object({
  SLACK_APP_TOKEN: z.string(),
  SLACK_BOT_TOKEN: z.string(),
  CMUEATS_CHANNEL_ID: z.string(),
  MONITORED_URLS: z.string().transform((str) => str.split(",")),
  MONITOR_INTERVAL_MS: z.coerce.number().default(10000),
  URL_TIMEOUT_MS: z.coerce.number().default(6000), // should be reasonably less than MONITOR_INTERVAL_MS
  ALERT_THRESHOLD_MS: z.coerce.number().default(60 * 1000),
  PING_THRESHOLD_MS: z.coerce.number().default(5 * 60 * 1000),
});
export const env = envSchema.parse(process.env);
