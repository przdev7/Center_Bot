import Discord, {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import verifySchema from "../../models/verifyModel";
import { BOT_VERSION } from "../../utils/constants";

interface data {
  GuildId: string;
  RoleId: string;
  messageId: string;
  ChannelId: string;
}

class VerifyCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  private obj: data | null;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("verify")
      .setDescription("Verification command")
      .addSubcommand((command) =>
        command
          .setName("setup")
          .setDescription("setup your channel & role")
          .addChannelOption((option) =>
            option.setName("channel").setDescription("Select channel for verification").setRequired(true),
          )
          .addRoleOption((option) =>
            option.setName("role-verify").setDescription("Select role for verification").setRequired(true),
          ),
      )
      .addSubcommand((command) => command.setName("send").setDescription("Sending verification panel"))
      .addSubcommand((command) => command.setName("remove").setDescription("Removing channel & role id from database"))
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    this.obj = null;
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === "setup") await this.setup(interaction);
    if (subCommand === "send") await this.send(interaction);
    if (subCommand === "remove") await this.remove(interaction);
    return;
  }

  private async setup(interaction: ChatInputCommandInteraction): Promise<void> {
    const verifiedRole = interaction.options.getRole("role-verify") as Discord.Role;
    const channel = interaction.options.getChannel("channel") as Discord.Channel;
    const guild = interaction.guild as Discord.Guild;
    const existingData = await verifySchema.findOne({ guild_id: guild.id });
    if (existingData) {
      const alreadySetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Verification is already set up!")
        .setColor("Red")
        .setImage("https://imgur.com/Uv62jPu.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [alreadySetup] });
      return;
    }
    if (existingData || !verifiedRole) {
      const somenthingWW = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Something went wrong")
        .setImage("https://imgur.com/Uv62jPu.png")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [somenthingWW] });
      return;
    }
    const data: data = {
      GuildId: guild.id,
      RoleId: verifiedRole.id,
      messageId: "",
      ChannelId: channel.id,
    };

    this.obj = data;
    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Set'uped verification")
      .setColor("Green")
      .setImage("https://imgur.com/Uv62jPu.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    await interaction.reply({ embeds: [embed] });
  }

  private async send(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!this.obj?.ChannelId || !this.obj.RoleId) {
      const ddntSetVerification = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You didn't setup verification, please use verify setup command.")
        .setColor("Red")
        .setImage("https://imgur.com/Uv62jPu.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [ddntSetVerification] });
      return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("verify_button")
        .setLabel("Verify yourself!")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success),
    );

    const verifiyEmbed = new EmbedBuilder()
      .setTitle("**Verification**")
      .setDescription(
        // eslint-disable-next-line max-len
        "To gain access to the server, you must click the button below, otherwise, you will not have access to the channels.",
      )
      .setImage("https://imgur.com/Uv62jPu.png")
      .setColor("Green")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    const channel = interaction.guild?.channels.cache.get(this.obj.ChannelId) as TextChannel;

    const verifyMessage = await channel.send({ embeds: [verifiyEmbed], components: [row] });

    await verifySchema.create({
      guild_id: this.obj.GuildId,
      role_id: this.obj.RoleId,
      message_id: verifyMessage.id,
      channel_id: this.obj.ChannelId,
    });

    await interaction.reply("verification has been sended");
  }
  private async remove(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guild?.id;
    const existingData = await verifySchema.findOne({ guild_id: guildId });
    if (!existingData) {
      const ddntSetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You didn't setup verification, please use verify setup command.")
        .setColor("Red")
        .setImage("https://imgur.com/Uv62jPu.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [ddntSetup] });
      return;
    }
    await verifySchema.deleteOne({ guild_id: guildId }).then(async () => {
      const verifiyEmbed = new EmbedBuilder()
        .setTitle("Success")
        .setDescription("Deleted from database.")
        .setColor("Green")
        .setImage("https://imgur.com/Uv62jPu.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [verifiyEmbed] });
    });
  }
}

export default VerifyCommand;
