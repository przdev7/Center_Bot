import { ClientEvents, Interaction } from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import verifySchema from "../../models/verifyModel";
class VerificationChannelDelete implements IEvent {
  name: keyof ClientEvents = "channelDelete";
  once = false;

  async execute(client: BotClient, channel: Interaction): Promise<void> {
    await verifySchema.findOneAndDelete({ guild_id: channel.guild?.id, channel_id: channel.id });
  }
}
export default VerificationChannelDelete;
