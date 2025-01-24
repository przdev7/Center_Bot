import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import { SlashCommandConfig } from "../../builders/SlashCommandConfig";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { version } from "../../../package.json";

class RerunCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  public slashCommandConfig: SlashCommandConfig;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder().setName("rerun").setDescription("Rerun some function");
    this.slashCommandConfig = new SlashCommandConfig().setDevOnly(true);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle("Rerunner!")
      .setDescription("Choose a button to rerun function!")
      .setColor("Blue")
      .setFooter({ text: `Center Bot Version: ${version} | D.E.V` });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("rerun_statistics")
        .setLabel("Rerun Statistics!")
        .setEmoji("⚡")
        .setStyle(ButtonStyle.Success),
    );
    const textChannel = interaction.channel as TextChannel;
    textChannel.send({ embeds: [embed], components: [row] });
    interaction.reply({ content: "Sent!", ephemeral: true });
  }
}

export default RerunCommand;
