import { ChatInputCommandInteraction, SlashCommandBuilder, User } from "discord.js";
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
    const { username }: User = interaction.options.getUser("user") || interaction.user;
    const reply = await interaction.reply({
      content: `Hacking ${username}`,
      fetchReply: true,
    });

    setTimeout(async () => {
      await reply.edit(`Looking for ${username} email and password`);
    }, ms("1s"));

    setTimeout(async () => {
      await reply.edit(`Found! Email: ${username}@gmail.com \nPassword: 0${username}123!.`);
    }, ms("6s"));

    setTimeout(async () => {
      await reply.edit("Looking for accounts.....");
    }, ms("9s"));

    setTimeout(async () => {
      await reply.edit("Found steam.....");
    }, ms("15s"));

    setTimeout(async () => {
      await reply.edit("Hacking steam account.....");
    }, ms("21s"));

    setTimeout(async () => {
      await reply.edit("Hacked steam account !!!!!!");
    }, ms("28s"));

    setTimeout(async () => {
      await reply.edit("Saving into database.....");
    }, ms("31s"));

    setTimeout(async () => {
      await reply.edit("Selling access....");
    }, ms("38s"));

    setTimeout(async () => {
      await reply.edit("Free cash earned");
    }, ms("41s"));

    setTimeout(async () => {
      await reply.delete();
    }, ms("50s"));
  }
}

export default HackCommand;
