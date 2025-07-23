import { env } from "../env";
import { SiteMonitor } from "./siteMonitor";

let siteMonitor: SiteMonitor | undefined = undefined;

const checkSite = (
  url: string,
  onError: (error: any) => any,
  onSuccess: (data: any) => any
) => {
  console.log(`Running check for ${url}`);
  fetch(url, { signal: AbortSignal.timeout(env.URL_TIMEOUT_MS) })
    .then(onSuccess)
    .catch(onError);
};

export const setUpUptimeChecker = (
  sendMessage: (msg: string) => Promise<any>
) => {
  siteMonitor = new SiteMonitor(
    env.MONITORED_URLS,
    sendMessage,
    env.ALERT_THRESHOLD_MS,
    env.PING_THRESHOLD_MS
  );
  setInterval(() => {
    env.MONITORED_URLS.forEach((site) =>
      checkSite(
        site,
        (error) => {
          console.log(`check failed for ${site}`, error);
          siteMonitor?.siteDown(site, error);
        },
        () => {
          console.log(`check successful for ${site}`);
          siteMonitor?.siteUp(site);
        }
      )
    );
  }, env.MONITOR_INTERVAL_MS);
};

export const getWebsiteStatusString = () => {
  return (
    siteMonitor?.getStatusAsString() ?? "Site monitor has not been initialized!"
  );
};
