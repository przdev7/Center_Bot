import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";

class EchoCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("echo")
      .setDescription("Send a message")
      .addStringOption((option) => option.setName("message").setDescription("message to bot send").setRequired(true));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = interaction.options.getString("message") as string;

    await interaction.reply(` \`${message}\` ~ ${interaction.user.username} `);
  }
}

export default EchoCommand;
