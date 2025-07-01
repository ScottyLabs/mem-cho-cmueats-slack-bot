import type { App } from "@slack/bolt";
import appHomeOpenedCallback from "./app-home-opened";
import { getWebsiteStatusString } from "../../intervals/uptimeChecker";
import { DateTime } from "luxon";

const register = (app: App) => {
  const startupTime = DateTime.local({ zone: "America/New_York" });
  app.event("app_home_opened", appHomeOpenedCallback);
  app.event("app_mention", async ({ payload, say }) => {
    await say({
      text: `hai! I'm here to let you know when cmueats goes down :3 \n\n*Website Status*\n${getWebsiteStatusString()} \n\n \`Startup time: ${startupTime.toLocaleString(
        {
          weekday: "short",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      )}\``,
      thread_ts: payload.ts,
    });
  });
};

export default { register };
