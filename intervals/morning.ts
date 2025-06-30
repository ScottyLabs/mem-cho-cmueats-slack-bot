import { App, StringIndexed } from "@slack/bolt";
import { DateTime } from "luxon";

const greetingTime = {
  hour: 9,
  minute: 0,
  second: 0,
  millisecond: 0,
};

const greetings = [
  "ohayou cmueats!",
  "morning",
  "yawwn good morning cmueats!",
  "How's life? Good morning!",
  "Do you ever wonder if you have free will?",
];
export const scheduleNextGreeting = (
  sendMessage: (msg: string) => Promise<unknown>,
  nextMorningTime: DateTime<true> // should be in desired timezone
) => {
  const currentTime = DateTime.local({ zone: "America/New_York" });
  console.log(
    `Scheduling morning message for ${nextMorningTime}. Current time: ${currentTime}`
  );
  setTimeout(() => {
    sendMessage(greetings[Math.floor(Math.random() * greetings.length)]);
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
