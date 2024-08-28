import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  EmbedField,
  SlashCommandBuilder,
} from "discord.js";

import BotClient from "../../client";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { BOT_VERSION } from "../../utils/constants";
class HelpCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  private chunk: EmbedField[][];
  private index: number;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder().setName("help").setDescription("Sends every bot command.");
    this.chunk = [];
    this.index = 0;
  }

  async execute(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    this.chunk = [];
    const { commands } = client;
    await interaction.deferReply();
    const fields = [] as EmbedField[];

    commands.map((command) => {
      const cmd = command as unknown as ICommand;
      fields.push({
        name: `\`/${cmd.slashCommandJSON?.name}\``,
        value: cmd.slashCommandJSON?.description,
        inline: false,
      });
    });

    const chunkSize = 5;
    for (let i = 0; i < fields.length; i += chunkSize) {
      this.chunk.push(fields.slice(i, i + chunkSize));
    }

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
    const helpEmbed = new EmbedBuilder()
      .setTitle("**Help**")
      .setColor("White")
      .addFields(this.chunk[this.index])
      .setTimestamp()
      .setImage("https://imgur.com/XYQCZCx.png")
      .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
      .setThumbnail(interaction.user.displayAvatarURL());
    const msg = await interaction.editReply({
      embeds: [helpEmbed],
      components: [row],
    });
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
        this.index += 1;
      } else if (i.customId === "help_last") {
        this.index = this.chunk.length - 1;
      }

      first.setDisabled(this.index === 0);
      previous.setDisabled(this.index <= 0);
      next.setDisabled(this.index >= this.chunk.length - 1);
      last.setDisabled(this.index === this.chunk.length - 1);
      pageCount.setLabel(`${this.index + 1}/${this.chunk.length}`);
      const updatedHelpEmbed = new EmbedBuilder()
        .setTitle("**Help**")
        .setColor("White")
        .addFields(...this.chunk[this.index])
        .setTimestamp()
        .setImage("https://imgur.com/XYQCZCx.png")
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
        .setThumbnail(interaction.user.displayAvatarURL());

      await i.editReply({ embeds: [updatedHelpEmbed], components: [row] });

      collector.resetTimer();
    });
    collector.on("end", async () => {
      await msg.edit({ embeds: [helpEmbed], components: [] }).catch(() => {});
    });
    return;
  }
}
export default HelpCommand;
