import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { Wordle } from "discord-gamecord";

class WordleCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder().setName("wordle").setDescription("Play a game of Wordle!");
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const game = new Wordle({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Wordle",
        color: "#5865F2",
      },
      timeoutTime: 300000,
      winMessage: "Congratulations {player}! You guessed the word correctly!",
      loseMessage: "Better luck next time! The word was **{word}**.",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    try {
      await game.startGame();
    } catch (error) {
      console.error("An error occurred while starting the Wordle game:", error);
      await interaction.reply({
        content: "An error occurred while starting the Wordle game. Please try again later.",
        ephemeral: true,
      });
    }
  }
}

export default WordleCommand;
