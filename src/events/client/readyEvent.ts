import { ClientEvents, TextChannel } from "discord.js";

import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";

class ReadyEvent implements IEvent {
  name: keyof ClientEvents = "ready";
  once = true;

  async execute(client: BotClient): Promise<void> {
    const channel = (await client.channels.fetch(process.env.ERROR_LOG_CHANNEL)) as TextChannel;
    console.log(`[CL] Logged in ${client.user?.displayName}`);
    await channel.send(`[CL] logged into account ${client.user?.displayName}`);
  }
}

export default ReadyEvent;
