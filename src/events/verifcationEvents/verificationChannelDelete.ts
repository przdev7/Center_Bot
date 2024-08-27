import { ClientEvents, Interaction } from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import verifySchema from "../../models/verifyModel";
class VerificationChannelDelete implements IEvent {
  name: keyof ClientEvents = "channelDelete";
  once = false;

  async execute(client: BotClient, channel: Interaction): Promise<void> {
    const messagesIds = await verifySchema.find({ guild_id: channel.guild?.id });

    for (const data of messagesIds) {
      if (data.channel_id !== channel.id) continue;

      await verifySchema.deleteOne({ channel_id: data.channel_id }).catch((err) => {
        console.log(err);
      });
    }
  }
}
export default VerificationChannelDelete;
