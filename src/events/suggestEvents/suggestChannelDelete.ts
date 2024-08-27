import { ClientEvents, Guild, Interaction } from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import suggestModel from "../../models/suggestModel";
class suggestChannelDelete implements IEvent {
  name: keyof ClientEvents = "channelDelete";
  once = false;

  async execute(client: BotClient, channel: Interaction): Promise<void> {
    await suggestModel.findOneAndDelete({ guild_id: (channel.guild as Guild).id, channel_id: channel.id });
  }
}
export default suggestChannelDelete;
