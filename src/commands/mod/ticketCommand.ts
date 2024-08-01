import {
  ActionRowBuilder,
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  Role,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextChannel,
} from "discord.js";
import ms from "ms";

import BotClient from "../../client";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import ticketSchema, { TicketCategory } from "../../models/ticketModel";
import { BOT_VERSION } from "../../utils/constants";
class TicketCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("ticket")
      .setDescription("Configure your ticket system!")
      .addSubcommand((command) => command.setName("create").setDescription("Create new ticket system"))
      .addSubcommand((command) => command.setName("cancel").setDescription("Cancel creating ticket system"))
      .addSubcommand((command) =>
        command
          .setName("remove")
          .setDescription("Delete category from ticket system")
          .addStringOption((option) =>
            option
              .setName("category-name")
              .setDescription("remove category from ticket system")
              .setMaxLength(50)
              .setRequired(true),
          ),
      )
      .addSubcommand((command) =>
        command
          .setName("add")
          .setDescription("Add category to ticket system")
          .addStringOption((option) =>
            option
              .setName("category-name")
              .setDescription("Type category name that you want to add")
              .setRequired(true)
              .setMaxLength(25),
          )
          .addStringOption((option) =>
            option
              .setName("category-description")
              .setDescription("Type category description that you want to add")
              .setRequired(true)
              .setMaxLength(150),
          ),
      )
      .addSubcommand((commmand) =>
        commmand
          .setName("send")
          .setDescription("Sending ticket system")
          .addChannelOption((option) =>
            option
              .setName("channel")
              .setDescription("channel to send ticket system")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true),
          )
          .addChannelOption((option) =>
            option
              .setName("category")
              .setDescription("category where tickets will appear")
              .addChannelTypes(ChannelType.GuildCategory)
              .setRequired(true),
          )
          .addStringOption((option) =>
            option.setName("title").setDescription("Type here title of the ticket embed").setRequired(true),
          )
          .addStringOption((option) =>
            option.setName("description").setDescription("Type here description of the ticket embed").setRequired(true),
          )
          .addStringOption((option) =>
            option
              .setName("color")
              .setDescription("Select color for embed")
              .setRequired(true)
              .addChoices(
                { name: "Blue", value: "#0000FF" },
                { name: "Green", value: "#008000" },
                { name: "Brown", value: "#A52A2A" },
                { name: "Red", value: "#FF0000" },
                { name: "Gray", value: "#808080" },
                { name: "White", value: "#FFFFFF" },
                { name: "Pink", value: "#FFC0CB" },
                { name: "Yellow", value: "#FFFF00" },
                { name: "Black", value: "#000000" },
                { name: "Purple", value: "#800080" },
                { name: "Orange", value: "#FFA500" },
              ),
          )
          .addRoleOption((option) =>
            option
              .setName("role")
              .setDescription("Select role that have permissions to ticket, VIEW, READ AND WRITE!")
              .setRequired(false),
          ),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }
  private category: TicketCategory[] = [];
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const option = interaction.options.getSubcommand();
    switch (option) {
      case "create": {
        await this.create(interaction);
        break;
      }
      case "cancel": {
        await this.cancel(interaction);
        break;
      }
      case "add": {
        await this.add(interaction);
        break;
      }
      case "remove": {
        await this.delete(interaction);
        break;
      }
      case "send": {
        await this.send(interaction);
        break;
      }
      default: {
        break;
      }
    }
  }
  private async create(interaction: ChatInputCommandInteraction): Promise<void> {
    const state = BotClient.getInstance().userState;

    const now = Date.now();
    const target = new Date(now + ms("5m")).getTime();
    const timeLeft = Math.floor(target / 1000);

    if (state.get(interaction.user.id) === this.slashCommandJSON.name) {
      const inCreatingTicket = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You are currently creating ticket system")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [inCreatingTicket], ephemeral: true });
    }

    BotClient.getInstance().userState.set(interaction.user.id, this.slashCommandJSON.name);

    const timeout = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("timeout, max time for ticket system = 5min")
      .setColor("Red")
      .setImage("https://imgur.com/Dui1IzU.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    const success = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(
        // eslint-disable-next-line max-len
        `successfully created new ticket system creator, <t:${timeLeft}:R> time will run out to create ticket system, now try  \`/ticket add\``,
      )
      .setColor("Green")
      .setImage("https://imgur.com/Dui1IzU.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.reply({ embeds: [success] });
    setTimeout(async () => {
      state.delete(interaction.user.id);
      await interaction.editReply({ embeds: [timeout] });
    }, ms("5m"));
  }
  private async cancel(interaction: ChatInputCommandInteraction): Promise<void> {
    const state = BotClient.getInstance().userState;

    if (state.get(interaction.user.id) !== this.slashCommandJSON.name) {
      const errorCanceling = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You are not creating ticket system")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [errorCanceling], ephemeral: true });
      return;
    }

    const successCanceling = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Successfully canceled creating ticket system")
      .setColor("Green")
      .setImage("https://imgur.com/Dui1IzU.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    state.delete(interaction.user.id);
    await interaction.reply({ embeds: [successCanceling] });
  }
  private async add(interaction: ChatInputCommandInteraction): Promise<void> {
    const cName = interaction.options.getString("category-name");
    const cDesc = interaction.options.getString("category-description");

    if (!cDesc || !cName) return;

    const state = BotClient.getInstance().userState;

    if (state.get(interaction.user.id) !== this.slashCommandJSON.name) {
      const errorCanceling = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You are not creating ticket system")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [errorCanceling], ephemeral: true });
      return;
    }
    if (
      this.category.find((name) => name.name === cName) ||
      this.category.find((description) => description.description === cDesc)
    ) {
      const errorCanceling = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You have already used this name/description or both")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [errorCanceling], ephemeral: true });
      return;
    }
    this.category.push({ name: cName, description: cDesc });
    const successAdd = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Successfully added category ${cName}`)
      .setColor("Green")
      .setImage("https://imgur.com/Dui1IzU.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.reply({ embeds: [successAdd], ephemeral: true });
  }
  private async send(interaction: ChatInputCommandInteraction): Promise<void> {
    const color: ColorResolvable = interaction.options.getString("color", true) as ColorResolvable;
    const state = BotClient.getInstance().userState;
    const eTitle = interaction.options.getString("title");
    const eDesc = interaction.options.getString("description");
    const ticketChannel = interaction.options.getChannel("channel") as TextChannel;
    const ticketCategory = interaction.options.getChannel("category") as CategoryChannel;
    const role = interaction.options.getRole("role") as Role;
    if (state.get(interaction.user.id) !== this.slashCommandJSON.name) {
      const errorCanceling = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You are not creating ticket system")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [errorCanceling], ephemeral: true });
      return;
    }
    if (this.category.length === 0) {
      const categoryError = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You haven't added roles try /ticket add")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [categoryError], ephemeral: true });
      return;
    }

    const ticketEmbed = new EmbedBuilder()
      .setTitle(eTitle)
      .setDescription(eDesc)
      .setImage("https://imgur.com/Dui1IzU.png")
      .setColor(color);

    const menu = new StringSelectMenuBuilder().setPlaceholder("Select category").setCustomId("ticket_selectmenu");

    const options = this.category.map((c) => ({
      label: c.name,
      description: c.description,
      value: c.name,
    }));

    menu.addOptions(options);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    const message = (await ticketChannel.send({
      embeds: [ticketEmbed],
      components: [row],
    })) as Message;

    const admnEmbed = new EmbedBuilder()
      .setTitle("Success")
      .setDescription("Successfully created ticket system!")
      .setColor("Green")
      .setImage("https://imgur.com/Dui1IzU.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await ticketSchema.create({
      guild_id: interaction.guild?.id,
      embed: {
        title: eTitle,
        description: eDesc,
        color: color,
      },
      message_id: message.id,
      role_id: role?.id || "not set'uped",
      channel_id: ticketChannel.id,
      category_id: ticketCategory.id,
      categories: this.category,
    });

    this.category = [];
    state.delete(interaction.user.id);
    await interaction.reply({ embeds: [admnEmbed] });
  }

  private async delete(interaction: ChatInputCommandInteraction): Promise<void> {
    const categoryName = interaction.options.getString("category-name");
    const state = BotClient.getInstance().userState;

    if (state.get(interaction.user.id) !== this.slashCommandJSON.name) {
      const errorCanceling = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You are not creating ticket system")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      await interaction.reply({ embeds: [errorCanceling], ephemeral: true });
      return;
    }
    if (this.category.length === 0) {
      const categoryError = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You haven't added roles try /ticket add")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [categoryError], ephemeral: true });
      return;
    }
    if (!this.category.find((obj) => obj.name === categoryName)) {
      const roleError = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("You haven't added such a role yet")
        .setColor("Red")
        .setImage("https://imgur.com/Dui1IzU.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
      await interaction.reply({ embeds: [roleError], ephemeral: true });
      return;
    }
    this.category = this.category.filter((obj) => {
      return obj.name !== categoryName;
    });
    const successRemove = new EmbedBuilder()
      .setTitle("Success")
      .setDescription(`Successfully removed ${categoryName}`)
      .setColor("Green")
      .setImage("https://imgur.com/Dui1IzU.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.reply({ embeds: [successRemove] });
  }
}
export default TicketCommand;
