import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import figlet from "figlet";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";

class AsciiCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("ascii")
      .setDescription("Convert text to ASCII art")
      .addStringOption((option) =>
        option.setName("message").setDescription("The message to convert to ASCII art").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("style")
          .setDescription("The ASCII style")
          .setRequired(true)
          .addChoices(
            { name: "Default", value: "standard" },
            { name: "Banner", value: "banner" },
            { name: "Big", value: "big" },
            { name: "Block", value: "block" },
            { name: "Bubble", value: "bubble" },
            { name: "Cyberlarge", value: "cyberlarge" },
            { name: "Cybermedium", value: "cybermedium" },
            { name: "Cybersmall", value: "cybersmall" },
            { name: "Doom", value: "doom" },
            { name: "Ghost", value: "ghost" },
            { name: "Mini", value: "mini" },
            { name: "Script", value: "script" },
            { name: "Shadow", value: "shadow" },
            { name: "Slant", value: "slant" },
            { name: "Small", value: "small" },
            { name: "Standard", value: "standard" },
            { name: "Star Wars", value: "starwars" },
            { name: "Stop", value: "stop" },
            { name: "Isometric1", value: "isometric1" },
            { name: "Isometric2", value: "isometric2" },
            { name: "Isometric3", value: "isometric3" },
            { name: "Isometric4", value: "isometric4" },
            { name: "Caligraphy", value: "caligraphy" },
            { name: "Graffiti", value: "graffiti" },
          ),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = interaction.options.getString("message", true);
    const style = interaction.options.getString("style", true);

    try {
      figlet.text(message, style as figlet.Fonts, (err: unknown, asciiArt: string | undefined) => {
        if (err) {
          console.error(err);
          return interaction.reply({
            content: "Failed to generate ASCII. Try again later.",
            ephemeral: true,
          });
        }
        interaction.reply(`\`\`\`${asciiArt}\`\`\``);
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "Failed to generate ASCII. Try again later.",
        ephemeral: true,
      });
    }
  }
}

export default AsciiCommand;
