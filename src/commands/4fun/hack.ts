import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import ms from "ms";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";

class HackCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;

  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("hack")
      .setDescription("Hacking some user")
      .addUserOption((option) => option.setName("user").setDescription("Select user to hack").setRequired(false));
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const { username } = interaction.options.getUser("user") || interaction.user;
    const reply = await interaction.reply({
      content: `Hacking ${username}`,
      fetchReply: true,
    });

    const messages = [
      `Looking for ${username} email and password`,
      `Found! Email: ${username}@gmail.com \nPassword: 0${username}123!.`,
      "Looking for accounts.....",
      "Found steam.....",
      "Hacking steam account.....",
      "Hacked steam account !!!!!!",
      "Saving into database.....",
      "Selling access....",
      "Free cash earned",
    ];

    const delays = [ms("1s"), ms("6s"), ms("9s"), ms("15s"), ms("21s"), ms("28s"), ms("31s"), ms("38s"), ms("41s")];

    let errorOccurred = false;

    for (let i = 0; i < messages.length; i += 1) {
      setTimeout(async () => {
        try {
          await reply.edit(messages[i]);
        } catch (e) {
          if (!errorOccurred) {
            errorOccurred = true;
            interaction.channel?.send("You deleted the message or something went wrong.");
          }
        }
      }, delays[i]);
    }

    setTimeout(async () => {
      try {
        await reply.delete();
      } catch (error) {
        console.log(error);
      }
    }, ms("50s"));
  }
}

export default HackCommand;
