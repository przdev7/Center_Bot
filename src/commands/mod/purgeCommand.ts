import { ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { ICommand, SlashCommandJSON } from "../../interfaces/ICommand";

class PurgeCommand implements ICommand {
  public slashCommandJSON: SlashCommandJSON;
  constructor() {
    this.slashCommandJSON = new SlashCommandBuilder()
      .setName("purge")
      .setDescription("Deleting messages.")
      .addNumberOption((option) =>
        option
          .setName("quantity")
          .setDescription("Enter message delete quantity")
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true),
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const quantity: number | null = interaction.options.getNumber("quantity");

      if (quantity === null) {
        await interaction.reply({ content: "Invalid quantity provided.", ephemeral: true });
        return;
      }
      if (interaction.channel?.type === ChannelType.DM) return;

      const fetchedMessages = await interaction.channel?.messages.fetch({
        limit: quantity,
        cache: false,
      });

      if (!fetchedMessages || fetchedMessages.size === 0) {
        await interaction.reply({ content: "Can't find any messages.", ephemeral: true });
        return;
      }
      await interaction.channel?.bulkDelete(quantity, true);

      await interaction.reply({
        // eslint-disable-next-line max-len
        content: `Deleted ${quantity} messages (bot can't delete messages older than 14 days for reset channel use /nuke).`,
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
export default PurgeCommand;
