import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ClientEvents,
  EmbedBuilder,
  GuildMember,
  Interaction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import BotClient from "../../client";
import { IEvent } from "../../interfaces/IEvent";
import ticketModel from "../../models/ticketModel";
import { BOT_VERSION } from "../../utils/constants";
class ticketManagementPanel implements IEvent {
  name: keyof ClientEvents = "interactionCreate";
  once = false;

  private hasSendedReq = false;
  async execute(client: BotClient, interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;
    if (interaction.customId.split("_")[0] !== "ticket") return;
    const ticketModerateRoleId = await ticketModel.findOne({ guild_id: interaction.guild?.id });
    const member = interaction.member as GuildMember;

    switch (interaction.customId) {
      case "ticket_del":
        await this.handleDelete(interaction);
        break;
      default: {
        const hasTicketRole = ticketModerateRoleId?.role_id && member.roles.cache.has(ticketModerateRoleId.role_id);
        const isDelInteraction =
          interaction.customId === "ticket_delDecline" || interaction.customId === "ticket_delConfirm";
        const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);

        if (((hasTicketRole && isDelInteraction) || isAdmin) && interaction.customId.split("_")[0] === "ticket") {
          switch (interaction.customId) {
            case "ticket_delDecline":
              await this.handleDeleteDecline(interaction);
              break;
            case "ticket_delConfirm":
              await this.handleDeleteConfirm(interaction);
              break;
            case "ticket_claim":
              await this.handleClaim(interaction);
              break;
          }
        } else {
          await this.handleNoPermissions(interaction);
        }
        break;
      }
    }
  }

  private async handleClaim(interaction: ButtonInteraction): Promise<void> {
    if (interaction.customId === "ticket_claim") {
      await interaction.channel?.send(`Ticket has been claimed by <@${interaction.user.id}>`).then((msgtopin) => {
        msgtopin.pin();
      });
      await interaction.reply({ content: "You claimed ticket", ephemeral: true });
    }
  }
  private async handleDelete(interaction: ButtonInteraction): Promise<void> {
    if (this.hasSendedReq) {
      const youSendedRequest = new EmbedBuilder()
        .setTitle("You already sended Request")
        .setDescription("your request has already been sent")
        .setColor("Red")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
        .setTimestamp();

      await interaction.reply({ embeds: [youSendedRequest], ephemeral: true });
      return;
    }

    const confirmationEmbed = new EmbedBuilder()
      .setTitle("Delete ticket request")
      .setDescription(` Deleting requested by <@${interaction.user.id}>`)
      .setColor("Red")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
      .setTimestamp();

    const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId("ticket_delConfirm").setLabel("Yes"),
      new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId("ticket_delDecline").setLabel("No"),
    );
    this.hasSendedReq = true;
    await interaction.reply({ embeds: [confirmationEmbed], components: [button] });
  }
  private async handleDeleteConfirm(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    const channel = interaction.channel as TextChannel;
    const confirmedEmbed = new EmbedBuilder()
      .setTitle("Your ticket will be deleted in 10 seconds!")
      .setDescription(`Accepted by <@${interaction.user.id}>`)
      .setColor("Green")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [confirmedEmbed], components: [] }).then(() => {
      setTimeout(async () => {
        this.hasSendedReq = false;
        await channel.delete();
      }, 10000);
    });
  }
  private async handleDeleteDecline(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    const declineEmbed = new EmbedBuilder()
      .setTitle("Your ticket won't be deleted")
      .setDescription(`Declined by <@${interaction.user.id}>`)
      .setColor("Red")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
      .setTimestamp();
    this.hasSendedReq = false;
    await interaction.editReply({ embeds: [declineEmbed], components: [] });
  }
  private async handleNoPermissions(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    const declineEmbed = new EmbedBuilder()
      .setTitle("You don't have permissions to do this!")
      .setDescription(`denied for <@${interaction.user.id}>`)
      .setColor("Red")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
      .setTimestamp();
    this.hasSendedReq = false;
    await interaction.editReply({ embeds: [declineEmbed], components: [] });
  }
}
export default ticketManagementPanel;
