import Discord, {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";
class ChannelCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("channel")
      .setDescription("Locking or unlocking channel.")
      .addSubcommand((command) =>
        command
          .setName("lock")
          .setDescription("Locking channel")
          .addChannelOption((o) => o.setName("channel").setDescription("Select channel")),
      )
      .addSubcommand((command) =>
        command
          .setName("unlock")
          .setDescription("Unlocking channel")
          .addChannelOption((o) => o.setName("channel").setDescription("Select channel")),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "lock":
        await this.lock(interaction);
        break;
      case "unlock":
        await this.unlock(interaction);
        break;
      default:
        await interaction.editReply({ content: "Invalid subcommand." });
    }
  }
  private async lock(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild as Guild;
    const channel = (interaction.options.getChannel("channel") as TextChannel) || (interaction.channel as TextChannel);
    const embed = new EmbedBuilder()
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    if (!channel.permissionsFor(guild?.id)?.has("SendMessages")) {
      await interaction.reply({
        embeds: [embed.setTitle("Error").setColor("Red").setDescription("Channel is already locked.")],
      });
      return;
    }
    await channel.permissionOverwrites.edit(guild.id, {
      SendMessages: false,
    });

    await interaction.reply({
      embeds: [embed.setTitle("Success!").setColor("Green").setDescription("Successfully locked channel")],
    });
  }
  private async unlock(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild as Guild;
    let channel = interaction.options.getChannel("channel") as TextChannel | null;
    if (!channel || channel === null) {
      channel = interaction.channel as TextChannel;
    }
    const embed = new Discord.EmbedBuilder()
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    if (channel.permissionsFor(guild?.id)?.has("SendMessages")) {
      await interaction.reply({
        embeds: [embed.setTitle("Error").setColor("Red").setDescription("Channel is already unlocked.")],
      });
      return;
    }
    channel.permissionOverwrites.edit(guild?.id, {
      SendMessages: true,
    });

    await interaction.reply({
      embeds: [embed.setTitle("Success!").setColor("Green").setDescription("Successfully unlocked channel")],
    });
  }
}

export default ChannelCommand;
