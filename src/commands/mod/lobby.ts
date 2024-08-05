import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import removeSchema from "../../models/memberRemoveModel";
import { BOT_VERSION } from "../../utils/constants";
import welcomeSchema from "../../models/welcomeModel";
class LobbyCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("lobby")
      .setDescription("Setup welocme & leave channel")
      .addSubcommandGroup((group) =>
        group
          .setName("leave")
          .setDescription("Setup/delete for leave channel.")
          .addSubcommand((command) =>
            command
              .setName("setup")
              .setDescription("Setuping leave for leave messages")
              .addChannelOption((option) =>
                option
                  .setName("channel")
                  .setDescription("Select channel for leave messages")
                  .setRequired(true)
                  .addChannelTypes(ChannelType.GuildText),
              ),
          )
          .addSubcommand((command) => command.setName("remove").setDescription("Removing channel id from database")),
      )
      .addSubcommandGroup((group) =>
        group
          .setName("welcome")
          .setDescription("Setup/delete for welcome channel")
          .addSubcommand((command) =>
            command
              .setName("setup")
              .setDescription("Setuping channel for welcome messages")
              .addChannelOption((option) =>
                option
                  .setName("channel")
                  .setDescription("Select channel for welcome messages")
                  .setRequired(true)
                  .addChannelTypes(ChannelType.GuildText),
              )
              .addRoleOption((option) =>
                option
                  .setName("role")
                  .setDescription("Select role for adding after user joining to server. OPTIONAL")
                  .setRequired(false),
              ),
          )
          .addSubcommand((command) => command.setName("remove").setDescription("Removing channel id from database")),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const group = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();

    switch (group) {
      case "welcome": {
        if (subCommand === "setup") await this.welcomeSetup(interaction);
        if (subCommand === "remove") await this.welcomeRemove(interaction);
        break;
      }
      case "leave": {
        if (subCommand === "setup") await this.leaveSetup(interaction);
        if (subCommand === "remove") await this.leaveRemove(interaction);
        break;
      }
    }

    return;
  }

  private async welcomeSetup(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("channel", true) as TextChannel;
    const role = interaction.options.getRole("role");
    const guild = interaction.guild as Guild;
    const existingData = await welcomeSchema.findOne({ guild_id: guild.id });
    if (existingData) {
      const alreadySetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Welcome function is already set up! If welcome messages don't send then use welcome remove.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [alreadySetup] });
      return;
    }

    await welcomeSchema.create({
      guild_id: guild.id,
      channel_id: channel.id,
      role_id: role?.id || undefined,
    });

    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Set'uped welcome function")
      .setColor("Green")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    await interaction.reply({ embeds: [embed] });
  }
  private async welcomeRemove(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild as Guild;
    const existingData = await welcomeSchema.findOne({ guild_id: guild.id });
    if (!existingData) {
      const ddntSetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You didn't setup welcome function, please use welcome setup command.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [ddntSetup] });
      return;
    }
    await welcomeSchema.deleteOne({ guild_id: guild.id }).then(async () => {
      const verifiyEmbed = new EmbedBuilder()
        .setTitle("Success")
        .setDescription("Deleted channel & role? from database.")
        .setColor("Green")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [verifiyEmbed] });
    });
  }
  private async leaveSetup(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("channel", true) as TextChannel;
    const guild = interaction.guild as Guild;
    const existingData = await removeSchema.findOne({ guild_id: guild.id });
    if (existingData) {
      const alreadySetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Leave function is already set up! If leave messages don't send then use leave remove.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [alreadySetup] });
      return;
    }
    await removeSchema.create({
      guild_id: guild.id,
      channel_id: channel.id,
    });
    const embed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Set'uped leave function")
      .setColor("Green")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    await interaction.reply({ embeds: [embed] });
  }
  private async leaveRemove(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild as Guild;
    const existingData = await removeSchema.findOne({ guild_id: guild.id });
    if (!existingData) {
      const ddntSetup = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You didn't setup leave function, please use leave setup command.")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [ddntSetup] });
      return;
    }
    await removeSchema.deleteOne({ guild_id: guild.id }).then(async () => {
      const verifiyEmbed = new EmbedBuilder()
        .setTitle("Success")
        .setDescription("Deleted channel from database.")
        .setColor("Green")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [verifiyEmbed] });
    });
  }
}
export default LobbyCommand;
