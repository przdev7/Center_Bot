import { ClientEvents, Guild, Interaction } from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import reactionRolesSchema from "../../models/reactionRolesModel";
class rrMessageDelete implements IEvent {
  name: keyof ClientEvents = "messageDelete";
  once = false;

  async execute(client: BotClient, msg: Interaction): Promise<void> {
    if (!msg.guild) return;
    await reactionRolesSchema.findOneAndDelete({ guild_id: (msg.guild as Guild).id, message_id: msg.id });
  }
}
export default rrMessageDelete;
