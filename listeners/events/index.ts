import type { App } from "@slack/bolt";
import appHomeOpenedCallback from "./app-home-opened";

const register = (app: App) => {
  app.event("app_home_opened", appHomeOpenedCallback);
  app.event("app_mention", async ({ payload, say }) => {
    await say({
      text: "hai! I'm here to let you know when cmueats goes down :3",
      thread_ts: payload.ts,
    });
  });
};

export default { register };
