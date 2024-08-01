import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  EmbedField,
  Guild,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";
import { SlashCommandConfig } from "../../builders/SlashCommandConfig";
class ServerListCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  public slashCommandConfig: SlashCommandConfig;

  private chunk: EmbedField[][];
  private index: number;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("serverslist")
      .setDescription("Display servers that bot in. Only for developers");
    this.slashCommandConfig = new SlashCommandConfig().setDevOnly(true);
    this.chunk = [];
    this.index = 0;
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guilds: Guild[] = interaction.client.guilds.cache.map((guild) => guild);

    const chunkSize = 5;
    for (let i = 0; i < guilds.length; i += chunkSize) {
      const embedFieldChunk: EmbedField[] = [];
      const currentChunk = guilds.slice(i, i + chunkSize);

      for (const [index, guild] of currentChunk.entries()) {
        const firstChannel = guild.channels.cache
          .filter((ch) => ch.type === ChannelType.GuildText)
          .first() as TextChannel;

        const invite = await firstChannel.createInvite({
          maxAge: 0,
          maxUses: 0,
        });

        embedFieldChunk.push({
          name: `${i + index + 1}.`,
          value: firstChannel
            ? `${guild.name}  ——  [invite](https://discord.gg/${invite.code})`
            : `${guild.name} [invite not available]`,
          inline: false,
        });
      }
      this.chunk.push(embedFieldChunk);
    }

    const embed = new EmbedBuilder()
      .setTitle("Servers")
      .setDescription("All servers where the bot is located")
      .setFields(this.chunk[this.index])
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
      .setThumbnail(interaction.user.displayAvatarURL())
      .setImage("https://imgur.com/XYQCZCx.png");

    const first = new ButtonBuilder()
      .setCustomId("help_first")
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Success)
      .setDisabled(this.index === 0);

    const previous = new ButtonBuilder()
      .setCustomId("help_previous")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Success)
      .setDisabled(this.index <= 0);

    const pageCount = new ButtonBuilder()
      .setCustomId("help_count")
      .setLabel(`${this.index + 1}/${this.chunk.length}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const next = new ButtonBuilder()
      .setCustomId("help_next")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Success)
      .setDisabled(this.index >= this.chunk.length - 1);

    const last = new ButtonBuilder()
      .setCustomId("help_last")
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Success)
      .setDisabled(this.index === this.chunk.length - 1);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(first, previous, pageCount, next, last);

    const msg = await interaction.reply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30 * 1000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return await i.reply({
          content: `Only **${interaction.user.username} can use these buttons!`,
          ephemeral: true,
        });
      }
      await i.deferUpdate();

      if (i.customId === "help_first") {
        this.index = 0;
      } else if (i.customId === "help_previous" && this.index > 0) {
        this.index -= 1;
      } else if (i.customId === "help_next" && this.index < this.chunk.length - 1) {
        this.index -= 1;
      } else if (i.customId === "help_last") {
        this.index = this.chunk.length - 1;
      }

      first.setDisabled(this.index === 0);
      previous.setDisabled(this.index <= 0);
      next.setDisabled(this.index >= this.chunk.length - 1);
      last.setDisabled(this.index === this.chunk.length - 1);
      pageCount.setLabel(`${this.index + 1}/${this.chunk.length}`);
      const updatedHelpEmbed = new EmbedBuilder()
        .setTitle("Servers")
        .setFields(...this.chunk[this.index])
        .setImage("https://imgur.com/XYQCZCx.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
        .setThumbnail(interaction.user.displayAvatarURL());

      await i.editReply({ embeds: [updatedHelpEmbed], components: [row] });

      collector.resetTimer();
    });
    collector.on("end", async () => {
      await msg.edit({ embeds: [embed], components: [] }).catch(() => {});
    });
    return;
  }
}

export default ServerListCommand;
