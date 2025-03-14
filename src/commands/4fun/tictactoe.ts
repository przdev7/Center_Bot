import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { TicTacToe } from "discord-gamecord";

class TicTacToeCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("tictactoe")
      .setDescription("Play a game of Tic Tac Toe!")
      .addUserOption((option) =>
        option.setName("opponent").setDescription("Select the opponent to play against").setRequired(true),
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const opponent = interaction.options.getUser("opponent", true);

    if (opponent.id === interaction.user.id) {
      interaction.reply({
        content: "You cannot play against yourself!",
        ephemeral: true,
      });
      return;
    }

    const Game = new TicTacToe({
      message: interaction,
      isSlashGame: true,
      opponent: opponent,
      embed: {
        title: "Tic Tac Toe",
        color: "#5865F2",
        statusTitle: "Status",
        overTitle: "GG's! Game Over!",
      },
      emojis: {
        xButton: "❌",
        oButton: "🔵",
        blankButton: "❔",
      },
      mentionUser: true,
      timeoutTime: 600000,
      xButtonStyle: "SECONDARY",
      oButtonStyle: "SECONDARY",
      turnMessage: "{emoji} | Its turn of player **{player}**.",
      winMessage: "{emoji} | **{player}** won the TicTacToe Game.",
      tieMessage: "The Game tied! No one won the Game!",
      timeoutMessage: "The Game went unfinished! No one won the Game!",
      playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
    });

    try {
      await Game.startGame();
    } catch (error) {
      console.error("An error occurred while starting the Tic Tac Toe game:", error);
      await interaction.reply({
        content: "An error occurred while starting the Tic Tac Toe game. Please try again later.",
        ephemeral: true,
      });
    }
  }
}

export default TicTacToeCommand;
