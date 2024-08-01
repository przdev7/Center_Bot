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

import statistics from "../../functions/statistics";
import { ICommand } from "../../interfaces/ICommand";
import statsSchema from "../../models/statsModel";
import { BOT_VERSION } from "../../utils/constants";
class StatisticsCommand implements ICommand {
  public slashCommandJSON: SlashCommandSubcommandsOnlyBuilder;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("statistics")
      .setDescription("Setup or remove channel for statistics.")
      .addSubcommand((command) =>
        command
          .setName("setup")
          .setDescription("Setuping channel for statistics")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("Select channel for statistics")
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildVoice),
          ),
      )
      .addSubcommand((command) => command.setName("remove").setDescription("Removing channel id from database"))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === "setup") await this.setup(interaction);
    if (subCommand === "remove") await this.remove(interaction);
    return;
  }
  private async setup(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("channel") as TextChannel;
    const guild = interaction.guild as Guild;
    const existingData = await statsSchema.findOne({ guild_id: guild.id });
    if (existingData) {
      const alreadySetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Statistics function is already set up! If statistics don't work then use statistics remove.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [alreadySetup] });
      return;
    }
    if (existingData || !channel) {
      const somenthingWW = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Something went wrong")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [somenthingWW] });
      return;
    }
    await statsSchema.create({
      guild_id: guild.id,
      channel_id: channel.id,
    });
    statistics();
    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Set'uped statistics function")
      .setColor("Green")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    await interaction.reply({ embeds: [embed] });
  }
  private async remove(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guild?.id;
    const existingData = await statsSchema.findOne({ guild_id: guildId });
    if (!existingData) {
      const ddntSetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You didn't setup statistics function, please use statistics setup command.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [ddntSetup] });
      return;
    }
    await statsSchema.deleteOne({ guild_id: guildId }).then(async () => {
      statistics();
      const verifiyEmbed = new EmbedBuilder()
        .setTitle("Success")
        .setDescription("Deleted channel from database.")
        .setColor("Green")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [verifiyEmbed] });
    });
  }
}

export default StatisticsCommand;
