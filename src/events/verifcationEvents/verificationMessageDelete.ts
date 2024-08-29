import { ClientEvents, Interaction } from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import verifySchema from "../../models/verifyModel";
class VerificationMessageDelete implements IEvent {
  name: keyof ClientEvents = "messageDelete";
  once = false;

  async execute(client: BotClient, msg: Interaction): Promise<void> {
    await verifySchema.findOneAndDelete({ guild_id: msg.guild?.id, message_id: msg.id });
  }
}
export default VerificationMessageDelete;
