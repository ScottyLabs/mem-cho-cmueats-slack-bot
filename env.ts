import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config(); // loads in .env file if present
console.log(process.env);
export interface ISiteTrackingInfo {
  url: string;
  doNotPing: boolean;
}
const envSchema = z.object({
  SLACK_APP_TOKEN: z.string(),
  SLACK_BOT_TOKEN: z.string(),
  CMUEATS_CHANNEL_ID: z.string(),
  MONITORED_URLS: z.string().transform((str) =>
    str.split(",").map((site) => {
      const [url, ignore] = site.split("|");
      if (ignore !== undefined) {
        console.log("Not pinging", url);
      }
      return {
        url,
        doNotPing: ignore !== undefined,
      } satisfies ISiteTrackingInfo;
    })
  ),
  /** Number of ms between pings on the same site */
  MONITOR_INTERVAL_MS: z.coerce.number().default(10000),
  /** Timeout for a single ping */
  URL_TIMEOUT_MS: z.coerce.number().default(6000), // should be reasonably less than MONITOR_INTERVAL_MS
  ALERT_THRESHOLD_MS: z.coerce.number().default(60 * 1000),
  PING_THRESHOLD_MS: z.coerce.number().default(5 * 60 * 1000),
  HOST_PLATFORM: z.string().default("unspecified"),
  DATABASE_URL: z.string().url(),
});
export const env = envSchema.parse(process.env);
