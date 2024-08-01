import { ClientEvents, Interaction } from "discord.js";

import { IEvent } from "../../interfaces/IEvent";
import memberRemoveSchema from "../../models/memberRemoveModel";
class LeaveChannelDelete implements IEvent {
  name: keyof ClientEvents = "channelDelete";
  once = false;

  async execute(channel: Interaction): Promise<void> {
    await memberRemoveSchema.find({ guild_id: channel.guild?.id, channel_id: channel.id });
  }
}
export default LeaveChannelDelete;
