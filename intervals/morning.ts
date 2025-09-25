import { DateTime } from "luxon";
import { getTodaysWeather } from "./weather";

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
      await getTodaysWeather().catch((e) => {
        console.error(e);
        return "Morning! I would give you the weather report for today, but the National Weather Service api seems to be unavailable. >_<";
      })
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
