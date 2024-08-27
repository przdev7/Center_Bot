import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ClientEvents,
  EmbedBuilder,
  Interaction,
  PermissionsBitField,
  StringSelectMenuInteraction,
} from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import ticketSchema from "../../models/ticketModel";
import { BOT_VERSION } from "../../utils/constants";
class InteractionCreateEvent implements IEvent {
  name: keyof ClientEvents = "interactionCreate";
  once = false;
  async execute(client: BotClient, interaction: Interaction): Promise<void> {
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_selectmenu")
      await this.handleTicketMenu(interaction);
    return;
  }

  private async handleTicketMenu(interaction: StringSelectMenuInteraction): Promise<void> {
    const guildId = interaction.guild?.id;
    const messageId = interaction.message.id;

    const ticketData = await ticketSchema.findOne({
      guild_id: guildId,
      message_id: messageId,
    });

    if (!ticketData) {
      await interaction.reply({
        content: "Category not found.",
        ephemeral: true,
      });
      return;
    }

    await interaction.guild?.channels
      .create({
        parent: ticketData.category_id,
        name: `[${interaction.values[0]}] ticket-${interaction.user.username}`,
        permissionOverwrites: [
          {
            id: interaction.guild?.id,
            deny: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: interaction.user?.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.SendMessages,
            ],
          },
        ],
      })
      .then(async (ch) => {
        if (ticketData.role_id) {
          ch.permissionOverwrites.create(ticketData.role_id, {
            ViewChannel: true,
            ReadMessageHistory: true,
            SendMessages: true,
          });
        }
        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle("Ticket")
          .setDescription("Hello. Please wait for your administrator to help you.")
          .addFields([
            {
              name: "1.1",
              value: `Your name: <@${interaction.user.id}> id: ${interaction.user.id}`,
              inline: false,
            },
            {
              name: "1.2",
              value: `Category: ${interaction.values[0]}`,
            },
            {
              name: "1.3",
              value: "**Patience**. Please wait patiently.",
              inline: false,
            },
            {
              name: "1.4",
              value: "**PING**. Don't tag anyone. ",
              inline: false,
            },
          ])
          .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
          .setTimestamp();

        const ticketManagementPanel = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Ticket Management Panel")
          .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId("ticket_del").setLabel("🗑️ | Delete ticket").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("ticket_claim").setLabel("🤝 | Claim ticket").setStyle(ButtonStyle.Success),
        );
        await ch.send({
          content: `${interaction.member}`,
          embeds: [embed],
        });
        await ch.send({ embeds: [ticketManagementPanel], components: [row] });
        await interaction.reply({
          content: `> Your ticket has been created, channel -> ${ch}`,
          ephemeral: true,
        });
      });
  }
}
export default InteractionCreateEvent;
