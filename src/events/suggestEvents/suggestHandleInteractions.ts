import { ButtonInteraction, ClientEvents, Embed, EmbedBuilder, Interaction, Message } from "discord.js";
import BotClient from "../../client";
import formatResults from "../../functions/formatResults";
import { IEvent } from "../../interfaces/IEvent";
import suggestSchema, { SuggestArray } from "../../models/suggestModel";
import { BOT_VERSION } from "../../utils/constants";
import suggestionStatus from "../../utils/suggestionStatus";
class SuggestHandleInteractions implements IEvent {
  name: keyof ClientEvents = "interactionCreate";
  once = false;
  async execute(client: BotClient, interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;
    if (interaction.customId.split("_")[0] !== "suggestion") return;

    const suggestionData = await suggestSchema.findOne({ guild_id: interaction.guild?.id });
    const suggestion = suggestionData?.suggestions.find(
      (suggestion) => suggestion.message_id === interaction.message.id,
    );

    if (!suggestionData || !suggestion) return;

    switch (interaction.customId) {
      /*
      TODO: zfixowac to ze jak zajdzie jakas interakcja to wtedy author zmienia sie na tego ktory wykonal interakcje
      np jezeli szczur zrobil sugestie i ustawiony jest jego profil i jego name w setAuthor()
      i ja dam upvote to zmienia sie na moje profilowe i moja nazwe
      */

      case "suggestion_upvote": {
        await this.handleVote(interaction, suggestion, true);
        await suggestionData.save();
        break;
      }
      case "suggestion_downvote": {
        await this.handleVote(interaction, suggestion, false);
        await suggestionData.save();
        break;
      }
      case "suggestion_accept": {
        await this.accept(interaction, suggestion);
        const index = suggestionData.suggestions.findIndex((s) => s.message_id === suggestion.message_id);
        if (index !== -1) {
          suggestionData.suggestions.splice(index, 1);
        }
        await suggestionData.save();
        break;
      }
      case "suggestion_decline": {
        await this.decline(interaction, suggestion);
        const index = suggestionData.suggestions.findIndex((s) => s.message_id === suggestion.message_id);
        console.log(index);
        if (index !== -1) {
          suggestionData.suggestions.splice(index, 1);
        }
        await suggestionData.save();
        break;
      }
    }
  }

  private async handleVote(interaction: ButtonInteraction, suggestion: SuggestArray, isUpVote: boolean): Promise<void> {
    const hasVoted =
      suggestion?.upvotes.includes(interaction.user.id) || suggestion?.downvotes.includes(interaction.user.id);

    if (hasVoted) {
      await interaction.reply({ content: "you already voted", ephemeral: true });
      return;
    }

    await interaction.deferUpdate();

    if (isUpVote) {
      suggestion.upvotes.push(interaction.user.id);
    } else {
      suggestion.downvotes.push(interaction.user.id);
    }

    const targetMessage = (await interaction.channel?.messages.fetch(suggestion.message_id)) as Message;

    const { components } = targetMessage;
    const embedMessage: Embed = targetMessage.embeds[0];
    const content = embedMessage.fields[0].value;

    const updatedEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ size: 256 }),
      })
      .setColor("Green")
      .addFields([
        { name: "Suggestion", value: `${content}` },
        { name: "Status", value: `${suggestionStatus.pending} ⏳` },
        { name: "Votes", value: formatResults(suggestion.upvotes, suggestion.downvotes) },
      ])
      .setTimestamp()
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

    await interaction.editReply({ embeds: [updatedEmbed], components: components });
  }

  private async accept(interaction: ButtonInteraction, suggestion: SuggestArray): Promise<void> {
    if (!interaction.memberPermissions?.has("Administrator")) {
      await interaction.reply({
        content: "You don't have the required permissions to use this command.",
        ephemeral: true,
      });
      return;
    }
    if (!suggestion) return;

    await interaction.deferUpdate();

    const targetMessage = (await interaction.channel?.messages.fetch(suggestion.message_id)) as Message;

    const embedMessage: Embed = targetMessage.embeds[0];
    const content = embedMessage.fields[0].value;
    const pb = embedMessage.fields[2].value;

    const updatedEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ size: 256 }),
      })
      .setColor("Green")
      .addFields([
        { name: "Suggestion", value: `${content}` },
        {
          name: "Status",
          value: `${suggestionStatus.accepted} ✅ by ${interaction.user.username}`,
        },
        { name: "Votes", value: pb },
      ])
      .setTimestamp()
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    await interaction.editReply({ embeds: [updatedEmbed], components: [] });
  }
  private async decline(interaction: ButtonInteraction, suggestion: SuggestArray): Promise<void> {
    if (!interaction.memberPermissions?.has("Administrator")) {
      await interaction.reply({
        content: "You don't have the required permissions to use this command.",
        ephemeral: true,
      });
      return;
    }
    if (!suggestion) {
      await interaction.reply({
        content: "Internal server error.",
        ephemeral: true,
      });
      return;
    }
    console.log(suggestion);

    await interaction.deferUpdate();

    const targetMessage = (await interaction.channel?.messages.fetch(suggestion.message_id)) as Message;

    const embedMessage: Embed = targetMessage.embeds[0];
    const content = embedMessage.fields[0].value;
    const pb = embedMessage.fields[2].value;

    const updatedEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL({ size: 256 }),
      })
      .setColor("Green")
      .addFields([
        { name: "Suggestion", value: `${content}` },
        {
          name: "Status",
          value: `${suggestionStatus.declined} ❌ by ${interaction.user.username}`,
        },
        { name: "Votes", value: pb },
      ])
      .setTimestamp()
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });
    await interaction.editReply({ embeds: [updatedEmbed], components: [] });
  }
}
export default SuggestHandleInteractions;
