import Discord, { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { emojiArray } from "../../utils/constants";
import { SlashCommandConfig } from "../../builders/SlashCommandConfig";
import _ from "lodash";
class SetStatus implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  public slashCommandConfig: SlashCommandConfig;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("set-status")
      .setDescription("Sets the bot status to the user's nickname");
    this.slashCommandConfig = new SlashCommandConfig().setGlobalCooldown(1_800_000);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    interaction.client.user.setPresence({
      status: "online",
      activities: [
        {
          name: `${_.sample(emojiArray)} ${interaction.user.username}`,
          type: Discord.ActivityType.Listening,
        },
      ],
    });

    await interaction.reply(`Status has been set for \`${interaction.user.username}\` `);

    setTimeout(() => {
      interaction.client.user.setPresence({
        status: "online",
        activities: [{ name: "👀 Use /set-status", type: Discord.ActivityType.Watching }],
      });
    }, 1800 * 1000);
  }
}
export default SetStatus;
