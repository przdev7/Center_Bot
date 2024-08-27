import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
import { SlashCommandConfig } from "../../builders/SlashCommandConfig";
import _ from "lodash";

class MouseCatchCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  public slashCommandConfig: SlashCommandConfig;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("mousecatch")
      .addSubcommand((command) => command.setName("normal-mode").setDescription("Normal mode of the command"))
      .addSubcommand((command) => command.setName("advanced-mode").setDescription("Advanced mode of the command"))
      .setDescription("Test your reflexes by catching the mouse.");
    this.slashCommandConfig = new SlashCommandConfig();
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subCommand = interaction.options.getSubcommand();
    subCommand === "normal-mode"
      ? await this.startGame(interaction, 5000, false)
      : await this.startGame(interaction, 10000, true);
  }
  private async startGame(
    interaction: ChatInputCommandInteraction,
    timeLimit: number,
    isAdvanced: boolean,
  ): Promise<void> {
    const buttons = this.createButtons();
    const startTime = Date.now();
    const embed = new EmbedBuilder().setTitle("Catch the mouse!").setColor("White");

    const message = await interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(_.shuffle(buttons))],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: timeLimit,
    });

    let moveMouseInterval: NodeJS.Timeout | null = null;
    if (isAdvanced) {
      moveMouseInterval = setInterval(async () => {
        const randomButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(_.shuffle(buttons));
        await interaction.editReply({ components: [randomButtons] });
        if (moveMouseInterval) clearInterval(moveMouseInterval);
      }, 450);
    }

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({
          content: `Only **${interaction.user} can use these buttons!`,
          ephemeral: true,
        });
        return;
      }
      if (i.customId === "mouse") {
        const reactionTime = Date.now() - startTime;
        if (moveMouseInterval) clearInterval(moveMouseInterval);
        await i.update({
          embeds: [embed.setTitle(`You caught the mouse in ${reactionTime}ms!`).setColor("Green")],
          components: [],
        });
        collector.stop();
      } else {
        await i.update({
          embeds: [embed.setTitle("You missed! Try again!").setColor("Red")],
          components: [new ActionRowBuilder<ButtonBuilder>().addComponents(_.shuffle(buttons))],
        });
      }
    });

    collector.on("end", async (_, reason) => {
      if (moveMouseInterval) clearInterval(moveMouseInterval);
      if (reason === "time") {
        await interaction.editReply({
          embeds: [embed.setTitle("Time's up! The mouse got away.").setColor("Red")],
          components: [],
        });
      }
    });
  }

  private createButtons(): ButtonBuilder[] {
    const mouseButton = new ButtonBuilder().setCustomId("mouse").setLabel("🐭").setStyle(ButtonStyle.Primary);

    const otherButton1 = new ButtonBuilder().setCustomId("miss1").setLabel("🟦").setStyle(ButtonStyle.Secondary);

    const otherButton2 = new ButtonBuilder().setCustomId("miss2").setLabel("🟩").setStyle(ButtonStyle.Secondary);

    const otherButton3 = new ButtonBuilder().setCustomId("miss3").setLabel("🟥").setStyle(ButtonStyle.Secondary);

    const buttons = [mouseButton, otherButton1, otherButton2, otherButton3];

    return buttons;
  }
}

export default MouseCatchCommand;
