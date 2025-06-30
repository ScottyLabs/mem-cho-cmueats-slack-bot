import { App, LogLevel } from "@slack/bolt";
import * as dotenv from "dotenv";
import registerListeners from "./listeners";
import { setUpDailyGreeting } from "./intervals/morning";

dotenv.config();

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO,
});

/** Register Listeners */
registerListeners(app);
// setInterval(() => {
//   app.client.chat.postMessage({
//     text: "hi",
//     channel: "C0933GKG93Q",
//   });
// }, 500);
/** Start Bolt App */

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    app.logger.info("⚡️ Bolt app is running! ⚡️");
    setUpDailyGreeting(app, "C043UV30DHA");
  } catch (error) {
    app.logger.error("Unable to start App", error);
  }
})();
