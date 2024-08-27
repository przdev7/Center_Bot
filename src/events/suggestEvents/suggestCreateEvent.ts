import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ClientEvents,
  EmbedBuilder,
  Message,
  TextChannel,
  User,
} from "discord.js";
import BotClient from "../../client";
import formatResults from "../../functions/formatResults";
import { IEvent } from "../../interfaces/IEvent";
import suggestSchema from "../../models/suggestModel";
import { BOT_VERSION } from "../../utils/constants";
import suggestionStatus from "../../utils/suggestionStatus";
class SuggestCreateEvent implements IEvent {
  name: keyof ClientEvents = "messageCreate";
  once = false;
  async execute(client: BotClient, message: Message): Promise<void> {
    try {
      const suggestionsData = await suggestSchema.findOne({ guild_id: message.guild?.id });
      if (!suggestionsData || !suggestionsData.channel_id) return;
      if (message.channel?.id !== suggestionsData.channel_id) return;
      if (message.author.bot) return;

      const suggestChannel = message.client.channels.cache.get(suggestionsData.channel_id) as TextChannel;
      const { content } = message;
      const author = message.author as User;
      await message.delete();

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
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(upvoteBtn, downvoteBtn);
      const admnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptBtn, declineBtn);

      const msg = await suggestChannel.send({ embeds: [embed], components: [row, admnRow] });
      msg.startThread({
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
}
export default SuggestCreateEvent;
