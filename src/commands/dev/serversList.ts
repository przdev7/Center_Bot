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
import _ from "lodash";
class ServerListCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  public slashCommandConfig: SlashCommandConfig;

  private chunk: EmbedField[][];
  private index: number;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("serverslist")
      .setDescription("Display servers that bot in. Only for developers")
      .addSubcommand((c) => c.setName("list").setDescription("only for devs lol"))
      .addSubcommand((c) =>
        c
          .setName("search")
          .setDescription("only for devs lol")
          .addStringOption((option) =>
            option
              .setName("guildname")
              .setDescription("name or id of the guild you want to get ")
              .setAutocomplete(true)
              .setRequired(true),
          ),
      );
    this.slashCommandConfig = new SlashCommandConfig().setDevOnly(true);
    this.chunk = [];
    this.index = 0;
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const options = interaction.options.getSubcommand();

    switch (options) {
      case "list":
        await this.list(interaction);
        break;
      case "search":
        await this.search(interaction);
        break;
    }
  }

  private async list(interaction: ChatInputCommandInteraction): Promise<void> {
    const guilds: Guild[] = interaction.client.guilds.cache.map((guild) => guild);

    const chunkSize = 5;
    const chunks = _.chunk(guilds, chunkSize);

    for (const [chunkIndex, chunk] of chunks.entries()) {
      const embedFieldChunk: EmbedField[] = [];

      for (const [index, guild] of chunk.entries()) {
        embedFieldChunk.push({
          name: `${chunkIndex * chunkSize + index + 1}.`,
          value: `${guild.name}`,
          inline: false,
        });
      }
      this.chunk.push(embedFieldChunk);

      const embed = new EmbedBuilder()
        .setTitle("Servers")
        .setDescription("All servers where the bot is located")
        .setFields(this.chunk[this.index])
        .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
        .setThumbnail(interaction.user.displayAvatarURL())
        .setImage("https://imgur.com/XYQCZCx.png");

      const first = new ButtonBuilder()
        .setCustomId("serverlist_first")
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Success)
        .setDisabled(this.index === 0);

      const previous = new ButtonBuilder()
        .setCustomId("serverlist_previous")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Success)
        .setDisabled(this.index <= 0);

      const pageCount = new ButtonBuilder()
        .setCustomId("serverlist_count")
        .setLabel(`${this.index + 1}/${this.chunk.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const next = new ButtonBuilder()
        .setCustomId("serverlist_next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Success)
        .setDisabled(this.index >= this.chunk.length - 1);

      const last = new ButtonBuilder()
        .setCustomId("serverlist_last")
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Success)
        .setDisabled(this.index === this.chunk.length - 1);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(first, previous, pageCount, next, last);

      const msg = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

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

        if (i.customId === "serverlist_first") {
          this.index = 0;
        } else if (i.customId === "serverlist_previous" && this.index > 0) {
          this.index -= 1;
        } else if (i.customId === "serverlist_next" && this.index < this.chunk.length - 1) {
          this.index -= 1;
        } else if (i.customId === "serverlist_last") {
          this.index = this.chunk.length - 1;
        }

        first.setDisabled(this.index === 0);
        previous.setDisabled(this.index <= 0);
        next.setDisabled(this.index >= this.chunk.length - 1);
        last.setDisabled(this.index === this.chunk.length - 1);
        pageCount.setLabel(`${this.index + 1}/${this.chunk.length}`);
        const updatedServerlistEmbed = new EmbedBuilder()
          .setTitle("Servers")
          .setFields(...this.chunk[this.index])
          .setImage("https://imgur.com/XYQCZCx.png")
          .setFooter({ text: `Center Bot Version: ${BOT_VERSION}` })
          .setThumbnail(interaction.user.displayAvatarURL());

        await i.editReply({ embeds: [updatedServerlistEmbed], components: [row] });

        collector.resetTimer();
      });
      collector.on("end", async () => {
        await msg.edit({ embeds: [embed], components: [] }).catch(() => {});
      });
      return;
    }
  }
  private async search(interaction: ChatInputCommandInteraction): Promise<void> {
    const guilds: Guild[] = interaction.client.guilds.cache.map((guild) => guild);
    const guildIdOrName = interaction.options.getString("guildname", true);

    const guild = guilds.find((g) => g.name === guildIdOrName);

    if (!guild) {
      const guildNotFound = new EmbedBuilder().setTitle("Error").setDescription("Guild not found!").setColor("Red");
      await interaction.reply({
        embeds: [guildNotFound],
        ephemeral: true,
      });
      return;
    }
    const firstChannel = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildText).first() as TextChannel;

    const invite = await firstChannel.createInvite({
      maxAge: 0,
      maxUses: 0,
    });
    const onwerUsername = (await guild.fetchOwner()).user.username;

    const succesEmbed = new EmbedBuilder()
      .setTitle(guild.name)
      .setDescription("Info about servers")
      .setColor("Green")
      .setTimestamp()
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields([
        {
          name: "Guild ID:",
          value: guild.id,
          inline: false,
        },
        {
          name: "Server invite",
          value: firstChannel ? `[invite](https://discord.gg/${invite.code})` : "[invite not available]",
          inline: false,
        },
        {
          name: "Guild Owner:",
          value: onwerUsername,
          inline: false,
        },
        {
          name: "Bot has been added:",
          value: `<t:${Math.floor(guild.joinedTimestamp / 1000)}:R>`,
          inline: false,
        },
        {
          name: "Guild created Time:",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: false,
        },
        {
          name: "Guild Members:",
          value: `${guild.memberCount}`,
          inline: false,
        },
      ]);

    await interaction.reply({ embeds: [succesEmbed], ephemeral: true });
  }
}
export default ServerListCommand;
