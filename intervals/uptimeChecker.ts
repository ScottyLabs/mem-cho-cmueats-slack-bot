import { eq } from "drizzle-orm";
import { dbType } from "../db";
import { trackedSitesTable } from "../db/schema";
import { env } from "../env";
import { SiteMonitor } from "./siteMonitor";

let siteMonitor: SiteMonitor | undefined = undefined;

const checkSite = (
  url: string,
  onError: (error: string) => any,
  onSuccess: (responseTimeMs: number) => any
) => {
  console.log(`Running check for ${url}`);
  const start = performance.now();
  fetch(url, { signal: AbortSignal.timeout(env.URL_TIMEOUT_MS) })
    .then((res) => {
      if (res.status !== 200) onError(res.status + ": " + res.statusText);
      else onSuccess(performance.now() - start);
    })
    .catch((er) => onError(JSON.stringify(er.cause)));
};

export const setUpUptimeChecker = (
  sendMessage: (msg: string, channelId: string) => Promise<any>,
  db: dbType
) => {
  siteMonitor = new SiteMonitor(
    sendMessage,
    env.ALERT_THRESHOLD_MS,
    env.PING_THRESHOLD_MS,
    db
  );
  setInterval(async () => {
    const trackedURLs = await db
      .select()
      .from(trackedSitesTable)
      .where(eq(trackedSitesTable.actively_tracked, true));
    trackedURLs.forEach((site) =>
      checkSite(
        site.url,
        (error) => {
          siteMonitor?.siteDown(site, error);
        },
        (responseTime) => {
          siteMonitor?.siteUp(site, responseTime);
        }
      )
    );
  }, env.MONITOR_INTERVAL_MS);
};

export const getWebsiteStatusString = async () => {
  return (
    (await siteMonitor?.getStatusAsString()) ??
    "Site monitor has not been initialized!"
  );
};
