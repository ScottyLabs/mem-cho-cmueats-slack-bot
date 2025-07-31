import { App, LogLevel } from "@slack/bolt";
import registerListeners from "./listeners";
import { setUpDailyGreeting } from "./intervals/morning";
import { setUpUptimeChecker } from "./intervals/uptimeChecker";
import { env } from "./env";

/** Initialization */
const app = new App({
  token: env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO,
});

registerListeners(app);

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    const appUserId = (await app.client.auth.test()).bot_id;
    if (appUserId === undefined) throw new Error("Failed to get bot id!");

    app.logger.info("⚡️ Bolt app is running! ⚡️");
    app.logger.info(`Bot user id: ${appUserId}`);

    setUpDailyGreeting(async (msg) => {
      // make sure latest message was not by mem-cho
      const latestMessage = (
        await app.client.conversations
          .history({
            limit: 1,
            channel: env.CMUEATS_CHANNEL_ID,
          })
          .catch((er) => app.logger.error(er))
      )?.messages?.[0];

      if (latestMessage?.bot_profile?.id !== appUserId) {
        app.logger.info("Sending morning greeting :3");
        app.client.chat
          .postMessage({
            text: msg,
            channel: env.CMUEATS_CHANNEL_ID,
          })
          .catch((er) => app.logger.error(er));
      } else {
        app.logger.info("Skipping morning greeting. Dead chat");
      }
    });

    setUpUptimeChecker((msg) =>
      app.client.chat
        .postMessage({
          text: msg,
          channel: env.CMUEATS_CHANNEL_ID,
        })
        .catch(app.logger.error)
    );
  } catch (error) {
    app.logger.error("Unable to start App", error);
  }
})();
