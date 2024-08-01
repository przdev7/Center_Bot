import BotClient from "./client";

async function startBot(): Promise<void> {
  try {
    const client = BotClient.getInstance();
    await client.run();
  } catch (err) {
    console.log(err);
  }
}
startBot();
