import type { App } from "@slack/bolt";

class GabeSenpaiMessages {
  index = 0;
  messages = [
    "who ya calling senpai? He's mine!",
    "~Stop playing with my feelings >_<",
    "...",
    "...",
    "okay now you're just taunting me",
    "I'm 25! geez",
    "...",
    "",
    "",
    "*pouty face",
    "",
    "",
    "",
    "Please stop",
  ];
  lastMessageSentTimestamp = 0;
  FORGET_TIME_INTERVAL = 1000 * 60 * 30; // 30 min

  getNextMessage() {
    const curTimestamp = +new Date();
    if (
      curTimestamp - this.lastMessageSentTimestamp >=
      this.FORGET_TIME_INTERVAL
    ) {
      this.index = 0;
    }
    this.lastMessageSentTimestamp = curTimestamp;
    if (this.index < this.messages.length) {
      return this.messages[this.index++];
    }
    return "";
  }
}

class MemChoMessages {
  index = 0;
  messages = ["someone mention me? :eyes:", "aw I love the attention"];
  lastMessageSentTimestamp = 0;
  FORGET_TIME_INTERVAL = 1000 * 60 * 30; // 30 min

  getNextMessage() {
    const curTimestamp = +new Date();
    if (
      curTimestamp - this.lastMessageSentTimestamp >=
      this.FORGET_TIME_INTERVAL
    ) {
      this.index = 0;
    }
    this.lastMessageSentTimestamp = curTimestamp;
    if (this.index < this.messages.length) {
      return this.messages[this.index++];
    }
    return "";
  }
}

const register = (app: App) => {
  const gabeMessages = new GabeSenpaiMessages();
  const memChoMessages = new MemChoMessages();
  app.message("gabe-senpai", async ({ say, message }: any) => {
    const nextMessage = gabeMessages.getNextMessage();
    if (nextMessage !== "") {
      await say({ text: nextMessage, thread_ts: message.ts }).catch(
        console.error
      );
    }
  });

  app.message("mem-cho", async ({ say, message }: any) => {
    const nextMessage = memChoMessages.getNextMessage();
    if (nextMessage !== "") {
      await say({ text: nextMessage, thread_ts: message.ts }).catch(
        console.error
      );
    }
  });
};

export default { register };
