import { DateTime } from "luxon";
import { env } from "../env";
import { trackedSitesTable, uptimeRecordsTable } from "../db/schema";
import { dbType } from "../db";
import { eq, gte, sql } from "drizzle-orm";
type SiteInfo = typeof trackedSitesTable.$inferSelect;
interface DownState {
  firstDownTimestamp: number;
  failErrors: string[];
  alertStage: "NONE" | "WARNED" | "PINGED";
}
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;
/**
 * wrapper for actually handling the logic when a site goes up or down
 */
export class SiteMonitor {
  downSites: Record<string, DownState> = {};
  sendMessage: (msg: string, channelId: string) => void;
  startupTime = DateTime.local({ zone: "America/New_York" });
  alertThresholdMs: number;
  pingThresholdMs: number;
  db: dbType;

  constructor(
    sendMessage: (msg: string, channelId: string) => void,
    alertThresholdMs: number,
    pingThresholdMs: number,
    db: dbType
  ) {
    this.sendMessage = sendMessage;
    this.alertThresholdMs = alertThresholdMs;
    this.pingThresholdMs = pingThresholdMs;
    this.db = db;
  }
  async siteDown(site: SiteInfo, error: string) {
    console.log(`check failed for ${site.url}`, error);

    if (this.downSites[site.url] === undefined) {
      this.downSites[site.url] = {
        firstDownTimestamp: Date.now(),
        failErrors: [],
        alertStage: "NONE",
      };
    }

    const downState = this.downSites[site.url];
    downState.failErrors.push(error);
    await this.db.insert(uptimeRecordsTable).values({
      up: false,
      details: error,
      site_id: site.id,
    });

    if (
      Date.now() - downState.firstDownTimestamp >= this.alertThresholdMs &&
      downState.alertStage === "NONE"
    ) {
      downState.alertStage = "WARNED";
      this.sendMessage(
        `~hey uh ${site.display_name} (${
          site.url
        }) has been down for the past ${
          this.alertThresholdMs / 1000
        } seconds with the following errors: ${downState.failErrors.join(
          ", "
        )}`,
        site.channel_to_notify
      );
    }
    if (
      Date.now() - downState.firstDownTimestamp >= this.pingThresholdMs &&
      downState.alertStage === "WARNED" &&
      site.should_ping
    ) {
      downState.alertStage = "PINGED";
      this.sendMessage(
        `<!channel>! ${site.display_name} (${
          site.url
        }) has been down for the past ${
          this.pingThresholdMs / 1000
        } seconds with ${downState.failErrors.length} errors`,
        site.channel_to_notify
      );
    }
  }
  async siteUp(site: SiteInfo, responseTimeMs: number) {
    console.log(`check successful for ${site.url}`);

    await this.db.insert(uptimeRecordsTable).values({
      up: true,
      details: null,
      site_id: site.id,
      response_time_ms: responseTimeMs,
    });
    if (this.downSites[site.url] === undefined) return;

    if (this.downSites[site.url].alertStage !== "NONE") {
      this.sendMessage(
        `${site.display_name} (${site.url}) is back up! :3`,
        site.channel_to_notify
      );
    }
    delete this.downSites[site.url];
  }

  async getStatusAsString() {
    const siteStatusSubquery = this.db
      .select({
        site_id: uptimeRecordsTable.site_id,
        upCount:
          sql<string>`count(CASE WHEN ${uptimeRecordsTable.up} THEN 1 END)`.as(
            "up_count"
          ),
        downCount:
          sql<string>`count(CASE WHEN NOT ${uptimeRecordsTable.up} THEN 1 END)`.as(
            "down_count"
          ),
        responseTime: sql<
          number | null
        >`AVG(${uptimeRecordsTable.response_time_ms})`.as(
          "average_response_time"
        ),
      })
      .from(uptimeRecordsTable)
      .where(
        gte(
          uptimeRecordsTable.time_checked,
          new Date(Date.now() - THIRTY_DAYS_MS)
        )
      )
      .groupBy(uptimeRecordsTable.site_id)
      .as("t");
    const allSiteData = await this.db
      .select()
      .from(siteStatusSubquery)
      .innerJoin(
        trackedSitesTable,
        eq(siteStatusSubquery.site_id, trackedSitesTable.id)
      )
      .where(eq(trackedSitesTable.actively_tracked, true));

    const websiteLines = allSiteData
      .map(({ t, sites: site }) => {
        const upCount = parseInt(t.upCount);
        const downCount = parseInt(t.downCount);
        return `${
          this.downSites[site.url] === undefined
            ? ":cmueats-up:"
            : ":cmueats-down:"
        } \`${((upCount / (upCount + downCount)) * 100)
          .toFixed(3)
          .padStart(7)}%\` *${site.display_name}* (${site.url}) \`${upCount}/${
          upCount + downCount
        }\` \`${
          t.responseTime === null
            ? "N/A"
            : "~" + t.responseTime.toFixed(0) + "ms"
        }\``;
      })
      .join("\n");
    return `*Website Status*\n${websiteLines}\n\nStartup time: \`${this.startupTime.toLocaleString(
      {
        weekday: "short",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}\`\nHosted on: \`${env.HOST_PLATFORM}\``;
  }
}
