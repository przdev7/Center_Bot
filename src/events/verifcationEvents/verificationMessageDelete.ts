import { ClientEvents, Interaction } from "discord.js";

import { IEvent } from "../../interfaces/IEvent";
import verifySchema from "../../models/verifyModel";
class VerificationMessageDelete implements IEvent {
  name: keyof ClientEvents = "messageDelete";
  once = false;

  async execute(msg: Interaction): Promise<void> {
    const messagesIds = await verifySchema.find({ guild_id: msg.guild?.id });
    for (const data of messagesIds) {
      if (data.message_id !== msg.id) continue;

      await verifySchema.deleteOne({ message_id: data.message_id }).catch((err) => {
        console.log(err);
      });
    }
  }
}
export default VerificationMessageDelete;
