import { ClientEvents, Interaction } from "discord.js";
import DevsModel from "../../models/devsModel";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import statistics from "../../functions/statistics";

class RerunEvent implements IEvent {
  name: keyof ClientEvents = "interactionCreate";
  once = false;

  async execute(client: BotClient, interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;

    if (interaction.customId === "rerun_statistics") {
      const devsData = await DevsModel.findOne();

      if (devsData && devsData.devs.includes(interaction.user.id)) {
        await interaction.reply({ content: "⚡ Rerunning statistics!", ephemeral: true });

        setTimeout(async () => {
          statistics();
          await interaction.editReply({ content: "⚡ Successfully reran statistics!" });
        }, 1000);
      } else {
        await interaction.reply({ content: "😡 You are NOT a developer of this bot.", ephemeral: true });
      }
    }
  }
}

export default RerunEvent;
