import { DateTime } from "luxon";
import { env } from "../env";
interface SiteData {
  downState?: {
    firstDownTimestamp: number;
    failErrors: string[];
    alerted: boolean;
  };
  successfulFetchCount: number;
  failedFetchCount: number;
}
const siteStatus: Record<string, SiteData> = {};
const startupTime = DateTime.local({ zone: "America/New_York" });

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
  for (const siteUrl of env.MONITORED_URLS) {
    siteStatus[siteUrl] = { successfulFetchCount: 0, failedFetchCount: 0 };
  }
  setInterval(() => {
    env.MONITORED_URLS.forEach((site) =>
      checkSite(
        site,
        (error) => {
          console.log(`check failed for ${site}`, error);
          siteStatus[site].failedFetchCount++;

          if (siteStatus[site].downState === undefined) {
            siteStatus[site].downState = {
              firstDownTimestamp: +new Date(),
              failErrors: [],
              alerted: false,
            };
          }
          const downState = siteStatus[site].downState;
          downState.failErrors.push(String(error));

          if (
            +new Date() - downState.firstDownTimestamp >=
              env.ALERT_THRESHOLD_MS &&
            !downState.alerted
          ) {
            downState.alerted = true;
            sendMessage(
              `Hi! ${site} has been down for the past ${
                env.ALERT_THRESHOLD_MS / 1000
              } seconds with the following errors: ${downState.failErrors.join(
                ", "
              )}`
            );
          }
        },
        () => {
          console.log(`check successful for ${site}`);
          siteStatus[site].successfulFetchCount++;
          if (siteStatus[site].downState !== undefined) {
            if (siteStatus[site].downState.alerted) {
              sendMessage(`${site} is back up!`);
            }
            siteStatus[site].downState = undefined;
          }
        }
      )
    );
  }, env.MONITOR_INTERVAL_MS);
};

const siteStatusToSingleLineString = (siteUrl: string, siteData: SiteData) => {
  return `${siteUrl}: Uptime: ${(
    (siteData.successfulFetchCount /
      (siteData.successfulFetchCount + siteData.failedFetchCount)) *
    100
  ).toFixed(3)}% (${siteData.successfulFetchCount}/${
    siteData.successfulFetchCount + siteData.failedFetchCount
  }) *CURRENT STATUS:* ${siteData.downState === undefined ? "UP" : "DOWN"}`;
};

export const getWebsiteStatusString = () => {
  const websiteLines = Object.entries(siteStatus)
    .map(([siteUrl, siteData]) =>
      siteStatusToSingleLineString(siteUrl, siteData)
    )
    .join("\n");
  return `*Website Status*\n${websiteLines}\n\n \`Startup time: ${startupTime.toLocaleString(
    {
      weekday: "short",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }
  )}\``;
};
