import { ClientEvents, Interaction } from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import memberRemoveSchema from "../../models/memberRemoveModel";
class LeaveChannelDelete implements IEvent {
  name: keyof ClientEvents = "channelDelete";
  once = false;

  async execute(client: BotClient, channel: Interaction): Promise<void> {
    await memberRemoveSchema.findOneAndDelete({ guild_id: channel.guild?.id, channel_id: channel.id });
  }
}
export default LeaveChannelDelete;
