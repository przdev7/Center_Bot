import { ClientEvents, Interaction } from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import welcomeSchema from "../../models/welcomeModel";
class WelcomeChannelDelete implements IEvent {
  name: keyof ClientEvents = "channelDelete";
  once = false;

  async execute(client: BotClient, channel: Interaction): Promise<void> {
    await welcomeSchema.findOneAndDelete({ guild_id: channel.guild?.id, channel_id: channel.id });
  }
}
export default WelcomeChannelDelete;
