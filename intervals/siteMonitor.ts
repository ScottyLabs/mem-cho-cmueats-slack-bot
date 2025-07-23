import { DateTime } from "luxon";

interface SiteData {
  downState?: {
    firstDownTimestamp: number;
    failErrors: string[];
    alertStage: "NONE" | "WARNED" | "PINGED";
  };
  successfulFetchCount: number;
  failedFetchCount: number;
}
export class SiteMonitor {
  siteStatus: Record<string, SiteData> = {};
  sendMessage: (msg: string) => void;
  startupTime = DateTime.local({ zone: "America/New_York" });
  alertThresholdMs: number;
  pingThresholdMs: number;

  constructor(
    sites: string[],
    sendMessage: (msg: string) => void,
    alertThresholdMs: number,
    pingThresholdMs: number
  ) {
    for (const siteUrl of sites) {
      this.siteStatus[siteUrl] = {
        successfulFetchCount: 0,
        failedFetchCount: 0,
      };
    }
    this.sendMessage = sendMessage;
    this.alertThresholdMs = alertThresholdMs;
    this.pingThresholdMs = pingThresholdMs;
  }
  siteDown(siteUrl: string, error: any) {
    if (this.siteStatus[siteUrl] === undefined) return;
    this.siteStatus[siteUrl].failedFetchCount++;

    if (this.siteStatus[siteUrl].downState === undefined) {
      this.siteStatus[siteUrl].downState = {
        firstDownTimestamp: +new Date(),
        failErrors: [],
        alertStage: "NONE",
      };
    }
    const downState = this.siteStatus[siteUrl].downState;
    downState.failErrors.push(String(error));

    if (
      +new Date() - downState.firstDownTimestamp >= this.alertThresholdMs &&
      downState.alertStage === "NONE"
    ) {
      downState.alertStage = "WARNED";
      this.sendMessage(
        `Hi! ${siteUrl} has been down for the past ${
          this.alertThresholdMs / 1000
        } seconds with the following errors: ${downState.failErrors.join(", ")}`
      );
    }
    if (
      +new Date() - downState.firstDownTimestamp >= this.pingThresholdMs &&
      downState.alertStage === "WARNED"
    ) {
      downState.alertStage = "PINGED";
      this.sendMessage(
        `Hi <!channel>! ${siteUrl} has been down for the past ${
          this.pingThresholdMs / 1000
        } seconds with the following errors: ${downState.failErrors.join(", ")}`
      );
    }
  }
  siteUp(siteUrl: string) {
    if (this.siteStatus[siteUrl] === undefined) return;

    this.siteStatus[siteUrl].successfulFetchCount++;
    if (this.siteStatus[siteUrl].downState !== undefined) {
      if (this.siteStatus[siteUrl].downState.alertStage !== "NONE") {
        this.sendMessage(`${siteUrl} is back up! :3`);
      }
      this.siteStatus[siteUrl].downState = undefined;
    }
  }

  getStatusAsString() {
    const websiteLines = Object.entries(this.siteStatus)
      .map(
        ([siteUrl, siteData]) =>
          `${siteUrl}: Uptime: ${(
            (siteData.successfulFetchCount /
              (siteData.successfulFetchCount + siteData.failedFetchCount)) *
            100
          ).toFixed(3)}% (${siteData.successfulFetchCount}/${
            siteData.successfulFetchCount + siteData.failedFetchCount
          }) *CURRENT STATUS:* ${
            siteData.downState === undefined ? "UP" : "DOWN"
          }`
      )
      .join("\n");
    return `*Website Status*\n${websiteLines}\n\n \`Startup time: ${this.startupTime.toLocaleString(
      {
        weekday: "short",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}\``;
  }
}
