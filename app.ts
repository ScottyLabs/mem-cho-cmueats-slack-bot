import { App, LogLevel } from "@slack/bolt";
import * as dotenv from "dotenv";
import registerListeners from "./listeners";
import { setUpDailyGreeting } from "./intervals/morning";
import { setUpUptimeChecker } from "./intervals/uptimeChecker";

dotenv.config();

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO,
});
const CMUEATS_CHANNEL_ID = process.env.CMUEATS_CHANNEL;
if (CMUEATS_CHANNEL_ID === undefined)
  throw new Error("Please include cmueats channel id");

registerListeners(app);

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    app.logger.info("⚡️ Bolt app is running! ⚡️");
    setUpDailyGreeting((msg) =>
      app.client.chat
        .postMessage({
          text: msg,
          channel: CMUEATS_CHANNEL_ID,
        })
        .catch(app.logger.error)
    );
    setUpUptimeChecker((msg) =>
      app.client.chat
        .postMessage({
          text: msg,
          channel: CMUEATS_CHANNEL_ID,
        })
        .catch(app.logger.error)
    );
  } catch (error) {
    app.logger.error("Unable to start App", error);
  }
})();
