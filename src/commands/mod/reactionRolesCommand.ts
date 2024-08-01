import {
  ActionRowBuilder,
  APIActionRowComponent,
  APIMessageActionRowComponent,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentEmojiResolvable,
  ComponentType,
  EmbedBuilder,
  Guild,
  Message,
  messageLink,
  NonThreadGuildBasedChannel,
  PermissionFlagsBits,
  roleMention,
  RoleSelectMenuBuilder,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import _ from "lodash";
import { SlashCommandConfig } from "../../builders/SlashCommandConfig";
import BotClient from "../../client";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import rrModel, { EmbedReactionRoles, ReactionRoles } from "../../models/reactionRolesModel";

interface IAutoCompleteValues {
  name: string;
  value: string;
}

interface IReactionChannel {
  channel_id: string;
  channel_name: string;
  message_id: string;
}

const embeds = {
  invalid_message_id: new EmbedBuilder().setTitle("Error").setDescription("Invalid message id").setColor("Red"),
  invalid_emoji: new EmbedBuilder().setTitle("Error").setDescription("Invalid emoji").setColor("Red"),
  role_duplicated: new EmbedBuilder().setTitle("Error").setDescription("This role is already added").setColor("Red"),
  invalid_channel_id: new EmbedBuilder().setTitle("Error").setDescription("Invalid channel id").setColor("Red"),
  role_not_found: new EmbedBuilder().setTitle("Error").setDescription("Role not found").setColor("Red"),
  only_one_role: new EmbedBuilder().setDescription("Cannot delete last role").setColor("Red"),
  role_is_everyone: new EmbedBuilder().setDescription("Cannot add everyone role").setColor("Red"),
  unknown_error: new EmbedBuilder().setDescription("Unknown error!").setColor("Red"),
  failed_send_msg: new EmbedBuilder().setDescription("Error when sending message ").setColor("Red"),
};

const constants = {
  title: "Reaction roles",
  creatingDescription: "Creating reaction roles message on",
  noRoles: "No roles, use /rr add to add roles",
};

class ReactionRolesCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("rr")
      .setDescription("Manage your reaction role system.")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addSubcommand((command) =>
        command
          .setName("create")
          .setDescription("Create new reaction roles")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("Where to send embed with reaction roles")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(false),
          ),
      )
      .addSubcommand((command) =>
        command
          .setName("add")
          .setDescription("Add roles to reaction roles")
          .addStringOption((option) =>
            option
              .setName("message_id")
              .setDescription("Search by message id or channel name")
              .setRequired(true)
              .setAutocomplete(true),
          )
          .addRoleOption((option) => option.setName("role").setDescription("Add Role").setRequired(true))
          .addStringOption((option) => option.setName("emoji").setDescription("Add emoji to button").setRequired(true)),
      )
      .addSubcommand((command) =>
        command
          .setName("remove")
          .setDescription("Remove role from reaction roles")
          .addStringOption((option) =>
            option.setName("message_id").setDescription("Message id").setRequired(true).setAutocomplete(true),
          ),
      );
  }
  slashCommandConfig?: SlashCommandConfig | undefined;

  async execute(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "create":
        await this.create(interaction);
        break;
      case "add":
        await this.add(interaction, client);
        break;
      case "remove":
        await this.remove(interaction, client);
        break;
      default:
        await interaction.editReply({ content: "Invalid subcommand." });
    }
  }

  private async create(interaction: ChatInputCommandInteraction): Promise<void> {
    const selectedChannel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel;
    await interaction.followUp(`${constants.creatingDescription} ${selectedChannel}...`);
    const templateEmbed = new EmbedBuilder()
      .setTitle(constants.title)
      .setDescription("No roles, use **/rr add** to add reaction roles");
    const msg = (await selectedChannel.send({ embeds: [templateEmbed] }).catch(async () => {
      await interaction.editReply({ embeds: [embeds.failed_send_msg] });
      return;
    })) as Message;
    const { commandId, commandName } = interaction;
    msg.edit({
      embeds: [
        EmbedBuilder.from(templateEmbed).setDescription(
          `No roles.
          Use </${commandName} add:${commandId}> with message id: **${msg.id}** to add reaction roles`,
        ),
      ],
    });

    const embedTemplate: EmbedReactionRoles = { title: constants.title, description: constants.noRoles };

    await rrModel.create({
      guild_id: interaction.guildId,
      channel_id: selectedChannel.id,
      message_id: msg.id,
      embed: embedTemplate,
      roles: [],
    });

    await interaction.editReply({
      embeds: [
        EmbedBuilder.from(templateEmbed).setDescription(
          `Use </${commandName} add:${commandId}> with message id: **${msg.id}** to add reaction roles`,
        ),
      ],
    });
  }

  private async add(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    const role = interaction.options.getRole("role", true);
    const emoji = interaction.options.getString("emoji", true);
    const messageId = interaction.options.getString("message_id", true);

    if (role.id === interaction.guildId) {
      await interaction.editReply({ embeds: [embeds.role_is_everyone] });
      return;
    }

    const matchedEmoji = this.extractEmoji(emoji);
    if (!matchedEmoji) {
      await interaction.editReply({ embeds: [embeds.invalid_emoji] });
      return;
    }

    const rrDatabase = await rrModel.findOne({ guild_id: interaction.guildId, message_id: messageId });
    if (!rrDatabase) {
      await interaction.editReply({ embeds: [embeds.invalid_message_id] });
      return;
    }

    if (rrDatabase.roles.some((r) => r.role_id === role.id)) {
      await interaction.editReply({ embeds: [embeds.role_duplicated] });
      return;
    }

    try {
      const channel = await client.channels.fetch(rrDatabase.channel_id);
      if (!channel) {
        await interaction.editReply({ embeds: [embeds.invalid_channel_id] });
        return;
      }

      const rrMessage = await (channel as TextChannel).messages.fetch(messageId as string);
      const updatedRoles = [...rrDatabase.roles, { role_id: role.id, emoji: matchedEmoji }];
      const newDescription = updatedRoles
        .map((role) => `${role.emoji || "⚠"} **——** ${roleMention(role.role_id)}`)
        .join("\n");

      const buttons = updatedRoles.map((role) =>
        new ButtonBuilder()
          .setCustomId(`rr-${role.role_id}-${interaction.guildId}`)
          .setEmoji(role.emoji as ComponentEmojiResolvable)
          .setStyle(ButtonStyle.Primary),
      );

      const actionRows = _.chunk(buttons, 5).map((chunk) => new ActionRowBuilder<ButtonBuilder>().addComponents(chunk));

      await rrDatabase.updateOne({ $push: { roles: { role_id: role.id, emoji: matchedEmoji } } });
      await rrMessage.edit({
        embeds: [EmbedBuilder.from(rrMessage.embeds[0]).setDescription(newDescription)],
        components: actionRows as unknown as APIActionRowComponent<APIMessageActionRowComponent>[],
      });

      await interaction.editReply({ content: `Role ${roleMention(role.id)} added successfully` });
    } catch {
      await interaction.editReply({ embeds: [embeds.invalid_channel_id] });
    }
  }

  private async remove(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    const messageId = interaction.options.getString("message_id", true);
    const rrDatabase = await rrModel.findOne({ guild_id: interaction.guildId, message_id: messageId });

    if (!rrDatabase) {
      await interaction.editReply({ embeds: [embeds.invalid_message_id] });
      return;
    }

    if (rrDatabase.roles.length <= 1) {
      await interaction.editReply({ embeds: [embeds.only_one_role] });
      return;
    }

    try {
      const channel = await client.channels.fetch(rrDatabase.channel_id);
      if (!channel) {
        await interaction.editReply({ embeds: [embeds.invalid_channel_id] });
        return;
      }

      const rrMessage = await (channel as TextChannel).messages.fetch(messageId).catch(() => {
        return null;
      });
      if (!rrMessage) {
        await interaction.editReply({ embeds: [embeds.invalid_message_id] });
        return;
      }
      const selectMenu = new RoleSelectMenuBuilder().setCustomId("reactionRoles").setPlaceholder("Make a selection!");

      const actionRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectMenu);
      const reply = await interaction.editReply({
        embeds: [new EmbedBuilder().setDescription("Select role to remove").setColor("White")],
        components: [actionRow],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.RoleSelect,
        time: 240000,
      });

      collector.on("collect", async (i) => {
        await i.update({ fetchReply: false });
        const selectedRoleId = i.values[0];
        if (selectedRoleId === interaction.guildId) return;

        const channel = await client.channels.fetch(rrDatabase.channel_id);
        if (!channel) {
          await interaction.editReply({ embeds: [embeds.invalid_channel_id] });
          return;
        }

        const rrMessage = await (channel as TextChannel).messages.fetch(messageId).catch(() => {
          return null;
        });

        if (!rrMessage) {
          await interaction.editReply({ embeds: [embeds.invalid_message_id] });
          return;
        }

        const roleIndex = rrDatabase.roles.findIndex((role) => role.role_id === selectedRoleId);
        if (roleIndex === -1) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  // eslint-disable-next-line max-len
                  `Role ${roleMention(selectedRoleId)} isn't from reaction role message (${messageLink(rrMessage.channelId, rrMessage.id)}`,
                )
                .setColor("Red"),
            ],
          });
          return;
        }

        const updatedRoles = rrDatabase.roles.filter((_, index) => index !== roleIndex);
        const newDescription = updatedRoles
          .map((role: ReactionRoles) => `${role.emoji} **——** ${roleMention(role.role_id)}`)
          .join("\n");

        const buttons = updatedRoles.map((role: ReactionRoles): ButtonBuilder => {
          return new ButtonBuilder()
            .setCustomId(`rr-${role.role_id}-${interaction.guildId}`)
            .setEmoji(role.emoji)
            .setStyle(ButtonStyle.Primary);
        });

        const actionRows = _.chunk(buttons, 5).map((chunk) =>
          new ActionRowBuilder<ButtonBuilder>().addComponents(chunk),
        );

        await rrDatabase.updateOne({ $pull: { roles: { role_id: selectedRoleId } } });
        await rrMessage.edit({
          embeds: [EmbedBuilder.from(rrMessage.embeds[0]).setDescription(newDescription)],
          components: actionRows as unknown as APIActionRowComponent<APIMessageActionRowComponent>[],
        });

        await interaction.editReply({
          embeds: [new EmbedBuilder().setDescription(`Removed ${roleMention(selectedRoleId)} role`).setColor("Red")],
        });
      });

      collector.on("end", async () => {
        await interaction.editReply({ content: "Timeout! Use command again!", embeds: [], components: [] });
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ embeds: [embeds.unknown_error] });
    }
  }

  private extractEmoji(str: string): string | boolean {
    const match = str.match(/((?<!\\)<:[^:]+:(\d+)>)|\p{Emoji_Presentation}|\p{Extended_Pictographic}/gmu);
    return match ? match[0] : "⚠";
  }

  public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused();
    const reactionMenus = await rrModel.find({ guild_id: interaction.guildId });

    const guildChannels = await (interaction.guild as Guild).channels.fetch();
    const reactionChannels: IReactionChannel[] = guildChannels
      .filter(
        (guildChannel): guildChannel is NonThreadGuildBasedChannel =>
          !!guildChannel && reactionMenus.some((reactionsMenu) => reactionsMenu.channel_id === guildChannel.id),
      )
      .map((guildChannel) => {
        const reactionMenu = reactionMenus.find((reactionsMenu) => reactionsMenu.channel_id === guildChannel.id);
        return {
          channel_id: guildChannel.id,
          channel_name: guildChannel.name,
          message_id: reactionMenu?.message_id || "",
        };
      });

    const filteredOptions = await Promise.all(
      reactionChannels
        .filter((menu) => menu.channel_id.startsWith(focusedValue) || menu.channel_name.startsWith(focusedValue))
        .slice(0, 25)
        .map((menu) => {
          return { name: `Channel: ${menu.channel_name}, Message ID: ${menu.message_id}`, value: menu.message_id };
        }),
    );

    await interaction.respond(filteredOptions.filter((option) => option !== null) as IAutoCompleteValues[]);
  }
}

export default ReactionRolesCommand;
