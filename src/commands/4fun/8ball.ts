import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommandJSON, ICommand } from "../../interfaces/ICommand";
import { eightBallReply } from "../../utils/constants";
import _ from "lodash";

class EightBallCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("8ball")
      .setDescription("A magic 8ball command 🎱")
      .addStringOption((option) => option.setName("question").setDescription("Type here question").setRequired(true));
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString("question", true);
    const reply = _.sample(eightBallReply);
    await interaction.reply(`- ${question} \n - ${reply}`);
  }
}

export default EightBallCommand;
