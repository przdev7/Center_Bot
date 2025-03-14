import { ClientEvents, Guild, Interaction, TextChannel } from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import suggestModel from "../../models/suggestModel";
class suggestChannelDelete implements IEvent {
  name: keyof ClientEvents = "messageDelete";
  once = false;

  async execute(client: BotClient, message: Interaction): Promise<void> {
    await suggestModel.updateOne(
      { guild_id: (message.guild as Guild).id, channel_id: (message.channel as TextChannel).id },
      { $pull: { suggestions: { message_id: message.id } } },
    );
  }
}
export default suggestChannelDelete;
