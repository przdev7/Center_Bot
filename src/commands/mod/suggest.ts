import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import suggestSchema from "../../models/suggestModel";
import { BOT_VERSION } from "../../utils/constants";
class SuggestCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("suggest")
      .setDescription("You can create a suggest system.")
      .addSubcommand((command) =>
        command
          .setName("setup")
          .setDescription("setup suggests channel")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("channel where suggestions can be made")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true),
          ),
      )
      .addSubcommand((command) => command.setName("remove").setDescription("delete suggests channel"))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const options = interaction.options.getSubcommand();

    switch (options) {
      case "setup": {
        await this.setup(interaction);
        break;
      }
      case "remove": {
        await this.remove(interaction);
        break;
      }
    }
  }
  private async setup(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("channel", true) as TextChannel;
    const existingData = await suggestSchema.findOne({ guild_id: interaction.guild?.id });
    if (existingData) {
      const alreadySetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("suggest channel is already set up! If suggest don't work then use suggest remove.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [alreadySetup] });
      return;
    }
    await suggestSchema.create({
      guild_id: interaction.guild?.id,
      channel_id: channel.id,
    });
    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Set'uped suggest channel")
      .setColor("Green")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    await interaction.reply({ embeds: [embed] });
  }
  private async remove(interaction: ChatInputCommandInteraction): Promise<void> {
    const existingData = await suggestSchema.findOne({ guild_id: interaction.guild?.id });
    if (!existingData) {
      const ddntSetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You didn't setup suggest channel, please use /suggest setup command.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [ddntSetup] });
      return;
    }
    await suggestSchema.deleteOne({ guild_id: interaction.guild?.id }).then(async () => {
      const verifiyEmbed = new EmbedBuilder()
        .setTitle("Success")
        .setDescription("Deleted channel from database.")
        .setColor("Green")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [verifiyEmbed] });
    });
  }
}
export default SuggestCommand;
