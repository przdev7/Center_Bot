import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
class PingCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder().setName("ping").setDescription("test command.");
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply(`Ping \`${interaction.client.ws.ping}\` `);
  }
}
export default PingCommand;
