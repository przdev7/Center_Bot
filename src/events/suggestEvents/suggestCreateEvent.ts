import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ClientEvents,
  EmbedBuilder,
  Message,
  TextChannel,
} from "discord.js";
import BotClient from "../../client";
import formatResults from "../../functions/formatResults";
import { IEvent } from "../../interfaces/IEvent";
import suggestSchema, { suggestionStatus } from "../../models/suggestModel";
import { version } from "../../../package.json";
class SuggestCreateEvent implements IEvent {
  name: keyof ClientEvents = "messageCreate";
  once = false;
  async execute(client: BotClient, message: Message): Promise<void> {
    try {
      if (message.author.bot) return;
      const suggestionsData = await suggestSchema.findOne({ guild_id: message.guild?.id });
      if (!suggestionsData || !suggestionsData.channel_id) return;
      if (message.channel?.id !== suggestionsData.channel_id) return;

      const suggestChannel = message.client.channels.cache.get(suggestionsData.channel_id) as TextChannel;
      const { content, author } = message;
      await message.delete();

      const embed = new EmbedBuilder()
        .setAuthor({
          name: author.username,
          iconURL: author.displayAvatarURL({ size: 256 }),
        })
        .addFields([
          { name: "Suggestion", value: `${content}` },
          { name: "Status", value: `${suggestionStatus.pending} ⏳` },
          { name: "Votes", value: formatResults() },
        ])
        .setColor("White")
        .setTimestamp()
        .setFooter({ text: `Center Bot Version: ${version}` });

      const row = this.getButtons();
      const admnRow = this.getAdminButtons();

      const msg = await suggestChannel.send({ embeds: [embed], components: [row, admnRow] });
      await msg.startThread({
        name: `Suggestion user ${author.username}`,
      });
      suggestionsData.suggestions.push({
        message_id: msg.id,
        upvotes: [],
        downvotes: [],
        status: suggestionStatus.pending,
      });
      await suggestionsData.save();
    } catch (err) {
      console.log(err);
    }
  }
  private getButtons(): ActionRowBuilder<ButtonBuilder> {
    const upvoteBtn = new ButtonBuilder()
      .setCustomId("suggestion_upvote")
      .setEmoji("👍")
      .setLabel("Upvote")
      .setStyle(ButtonStyle.Primary);

    const downvoteBtn = new ButtonBuilder()
      .setCustomId("suggestion_downvote")
      .setEmoji("👎")
      .setLabel("Downvote")
      .setStyle(ButtonStyle.Primary);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(upvoteBtn, downvoteBtn);
  }
  private getAdminButtons(): ActionRowBuilder<ButtonBuilder> {
    const acceptBtn = new ButtonBuilder()
      .setCustomId("suggestion_accept")
      .setEmoji("✅")
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success);

    const declineBtn = new ButtonBuilder()
      .setCustomId("suggestion_decline")
      .setEmoji("❌")
      .setLabel("Decline")
      .setStyle(ButtonStyle.Danger);

    return new ActionRowBuilder<ButtonBuilder>().addComponents(acceptBtn, declineBtn);
  }
}
export default SuggestCreateEvent;
