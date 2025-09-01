import { DateTime } from "luxon";
import { getWebsiteStatusString } from "./uptimeChecker";

const greetingTime = {
  hour: 9,
  minute: 7,
  second: 27, // WYSI
  millisecond: 0,
};

const greetings = [
  "ohayou cmueats!",
  "morning",
  "yawwn good morning cmueats!",
  "Good morning!",
  "New day, new life!",
  "aeeeeee",
  "why do we exist, honestly",
  "life is probably meaningless, oh well",
  "does true love exist?",
];
export const scheduleNextGreeting = (
  sendMessage: (msg: string) => Promise<unknown>,
  nextMorningTime: DateTime<true> // should be in desired timezone
) => {
  const currentTime = DateTime.local({ zone: "America/New_York" });
  console.log(
    `Scheduling morning message for ${nextMorningTime}. Current time: ${currentTime}`
  );
  setTimeout(async () => {
    sendMessage(
      `${
        greetings[Math.floor(Math.random() * greetings.length)]
      }\n\n${await getWebsiteStatusString()}`
    );
    scheduleNextGreeting(sendMessage, nextMorningTime.plus({ days: 1 })); // this actually accounts for DST properly
  }, nextMorningTime.diff(currentTime).toMillis());
};

/**
 *
 * @param sendMessage We expect it to catch its own error
 */
export const setUpDailyGreeting = (
  sendMessage: (msg: string) => Promise<unknown>
) => {
  const currentTime = DateTime.local({ zone: "America/New_York" });
  const nextMorningTime =
    currentTime.hour < greetingTime.hour ||
    (currentTime.hour === greetingTime.hour &&
      currentTime.minute < greetingTime.minute)
      ? currentTime.set(greetingTime)
      : currentTime.set(greetingTime).plus({ days: 1 });
  scheduleNextGreeting(sendMessage, nextMorningTime);
};
