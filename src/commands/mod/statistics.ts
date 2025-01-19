import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  TextChannel,
} from "discord.js";

import { ICommand } from "../../interfaces/ICommand";
import statsSchema from "../../models/statsModel";
import { version } from "../../../package.json";

class StatisticsCommand implements ICommand {
  public slashCommandJSON: SlashCommandSubcommandsOnlyBuilder;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("statistics")
      .setDescription("Setup or remove channel for statistics.")
      .addSubcommand((command) =>
        command
          .setName("setup")
          .setDescription("Setup channel for statistics")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("Select channel for statistics")
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildVoice),
          )
          .addStringOption((option) =>
            option
              .setName("format")
              .setDescription("Format for channel name (e.g., Members {members}, {totalUsers}, {totalBots})")
              .setRequired(true),
          ),
      )
      .addSubcommand((command) => command.setName("remove").setDescription("Remove statistics setup"))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === "setup") await this.setup(interaction);
    if (subCommand === "remove") await this.remove(interaction);
  }

  private async setup(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("channel", true) as TextChannel;
    const format = interaction.options.getString("format", true);
    const guild = interaction.guild as Guild;

    const existingData = await statsSchema.findOne({ guild_id: guild.id });
    if (existingData) {
      const alreadySetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Statistics is already set up! Use `/statistics remove` to reset it.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${version}` });
      await interaction.reply({ embeds: [alreadySetup] });
      return;
    }

    await statsSchema.create({
      guild_id: guild.id,
      channel_id: channel.id,
      format,
    });

    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Successfully set up the statistics function!")
      .setColor("Green")
      .setFooter({ text: `Center Bot Version: ${version}` });
    await interaction.reply({ embeds: [embed] });
  }

  private async remove(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guild?.id;
    const existingData = await statsSchema.findOne({ guild_id: guildId });

    if (!existingData) {
      const ddntSetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Statistics is not set up. Use `/statistics setup` to set it up first.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${version}` });
      await interaction.reply({ embeds: [ddntSetup] });
      return;
    }

    await statsSchema.deleteOne({ guild_id: guildId });

    const verifiyEmbed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Removed statistics setup from the database.")
      .setColor("Green")
      .setFooter({ text: `Center Bot Version: ${version}` });
    await interaction.reply({ embeds: [verifiyEmbed] });
  }
}

export default StatisticsCommand;
