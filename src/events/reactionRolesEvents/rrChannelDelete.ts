import { ClientEvents, Guild, Interaction } from "discord.js";

import { IEvent } from "../../interfaces/IEvent";
import reactionRolesSchema from "../../models/reactionRolesModel";
class rrChannelDelete implements IEvent {
  name: keyof ClientEvents = "channelDelete";
  once = false;

  async execute(channel: Interaction): Promise<void> {
    await reactionRolesSchema.findOneAndDelete({ guild_id: (channel.guild as Guild).id, channel_id: channel.id });
  }
}
export default rrChannelDelete;
