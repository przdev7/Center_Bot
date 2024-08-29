import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  HexColorString,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { version } from "../../../package.json";
class EmbedCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("embed")
      .setDescription("Sending embed.")
      .addStringOption((option) => option.setName("title").setDescription("Type here title of embed").setRequired(true))
      .addStringOption((option) => option.setName("hex-color").setDescription("Color of your embed (hex)"))
      .addStringOption((option) =>
        option.setName("description").setDescription("Type here description of embed").setRequired(false),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const title = interaction.options.getString("title", true);
    const description = interaction.options.getString("description");
    const color = interaction.options.getString("hex-color");

    if (color && !/^#([0-9a-f]{3}){1,2}$/i.test(color)) {
      await interaction.reply({
        content: "invalid color, valid example (#ffffff)",
        ephemeral: true,
      });
      return;
    }
    const embed = new EmbedBuilder().setTitle(title).setFooter({ text: `Center Bot Version: ${version}` });
    if (description) embed.setDescription(description);
    if (color) embed.setColor(color as HexColorString);

    try {
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({ content: "Something went wrong try again later.", ephemeral: true });
      console.log(err);
    }
  }
}
export default EmbedCommand;
