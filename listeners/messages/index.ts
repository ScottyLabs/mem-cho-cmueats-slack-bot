import type { App } from '@slack/bolt';

class GabeSenpaiMessages {
  index = 0;
  messages = [
    "who ya calling senpai? He's mine!",
    '~Stop playing with my feelings >_<',
    "okay now you're just taunting me",
    "I'm 27! geez",
    '*pouty face*',
    'Please stop',
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
    return '';
  }
}

class MemChoMessages {
  index = 0;
  messages = [
    'Ohayou~! Mem-Cho reporting for idol duty ⭐️',
    "Hehe, did someone say CMUEats? I'm totally hungry now (LOL)",
    "Streaming brain says this chat's about to go viral! 📈",
    'Still totally 17… probably… teehee~ 🙈',
    'B-Komachi power activate ✨',
    "Remember to chase your dreams—even if you're 27! Wait, who said that? 😳",
    'UwU need a friend? I gotchu 💛',
    "Cat-smile activated: nya~ what's up? 🐱",
    '#LifeHack: stay hydrated and sparkle on! 💧',
    'Ok, back to editing my next TikTok— keep the chat lively!',
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
    return '';
  }
}

const register = (app: App) => {
  const gabeMessages = new GabeSenpaiMessages();
  const memChoMessages = new MemChoMessages();
  app.message('gabe-senpai', async ({ say, message }: any) => {
    const nextMessage = gabeMessages.getNextMessage();
    if (nextMessage !== '') {
      await say({ text: nextMessage, thread_ts: message.ts }).catch(
        console.error
      );
    }
  });

  // Mem-Cho listener
  app.message('mem-cho', async ({ say, message }: any) => {
    const nextMessage = memChoMessages.getNextMessage();
    if (nextMessage !== '') {
      await say({ text: nextMessage, thread_ts: (message as any).ts }).catch(
        console.error
      );
    }
  });
};

export default { register };
