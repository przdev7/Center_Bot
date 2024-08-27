import { AutocompleteInteraction, ChatInputCommandInteraction, ClientEvents, Interaction } from "discord.js";
import NodeCache from "node-cache";

import { SlashCommandConfig } from "../../builders/SlashCommandConfig";
import BotClient from "../../client";
import { ICommand } from "../../interfaces/ICommand";
import { IEvent } from "../../interfaces/IEvent";
import devsModel from "../../models/devsModel";

class InteractionCreateEvent implements IEvent {
  name: keyof ClientEvents = "interactionCreate";
  once = false;

  private cooldowns: NodeCache = new NodeCache();
  private cache: NodeCache = new NodeCache();

  async execute(client: BotClient, interaction: Interaction): Promise<void> {
    switch (true) {
      case interaction instanceof ChatInputCommandInteraction:
        await this.handleChatInputCommand(interaction, client);
        break;
      case interaction instanceof AutocompleteInteraction:
        await this.handleAutoComplete(interaction, client);
        break;
    }
  }
  private async isDev(userId: string): Promise<boolean> {
    await this.getDevs();
    const devsArray = this.cache.get("developers") as string[] | undefined;
    if (!devsArray) return false;
    return devsArray.includes(userId);
  }
  private async getDevs(): Promise<void> {
    try {
      const devArray = await devsModel.find();
      if (!devArray) return;

      this.cache.set("developers", devArray[0].devs, 300);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  private async handleDevOnly(interaction: Interaction, client: BotClient): Promise<boolean> {
    try {
      const chatInteraction = interaction as ChatInputCommandInteraction;
      const cmd = client.commands.get(chatInteraction.commandName) as ICommand;

      if (!cmd.slashCommandConfig) return false;

      const isCommandDev = cmd.slashCommandConfig.dev;

      if (!isCommandDev) return false;
      if (await this.isDev(chatInteraction.user.id)) return false;

      await this.replyError(interaction, "this command is only for developers");
    } catch (error) {
      await this.replyError(interaction, "Error: Error while handling dev only command");
    }
    return true;
  }

  private async handleChatInputCommand(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void> {
    try {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) {
        await this.replyError(interaction, `Error: Command not found: ${interaction.commandName}`);
        return;
      }

      // local config logic
      if (cmd.slashCommandConfig) {
        if (await this.handleDevOnly(interaction, client)) return;
        if (await this.checkCooldowns(interaction, cmd)) return;
      }

      await cmd.execute(interaction, client);
    } catch (error) {
      console.error(`Error during interactionCreate ${interaction.commandName}:`, error);
      await this.replyError(interaction, "There was an error while executing this command!");
    }
  }

  private async handleAutoComplete(interaction: AutocompleteInteraction, client: BotClient): Promise<void> {
    try {
      const cmd = client.commands.get(interaction.commandName);

      if (!cmd || !cmd.autocomplete) return;

      await cmd.autocomplete(interaction, client);
    } catch (error) {
      console.error("Error handling autocomplete interaction:", error);
    }
  }

  private async replyError(interaction: Interaction, message: string): Promise<void> {
    try {
      const chatInteraction = interaction as ChatInputCommandInteraction;
      await chatInteraction.reply({
        content: message,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Failed to reply with error message:", error);
    }
  }

  private async checkCooldowns(interaction: Interaction, cmd: ICommand): Promise<boolean> {
    if (!cmd.slashCommandJSON || !interaction.guildId) return false;
    const commandName = cmd.slashCommandJSON.name;
    const { guildId } = interaction;
    const userId = interaction.user.id;
    const {
      cooldowns: { global: globalCooldown, guild: guildCooldown, user: userCooldown },
    } = cmd.slashCommandConfig as SlashCommandConfig;

    const cooldowns = [
      { type: "global", time: globalCooldown },
      { type: "guild", time: guildCooldown },
      { type: "user", time: userCooldown },
    ].filter((cooldown) => cooldown.time !== undefined) as { type: string; time: number }[];

    if (cooldowns.length === 0) return false;

    cooldowns.sort((a, b) => b.time - a.time);

    let key = `${userId}-${commandName}`;
    let type = "user";
    for (const cooldown of cooldowns) {
      switch (cooldown.type) {
        case "global":
          key = commandName;
          type = cooldown.type;
          break;
        case "guild":
          key = `${guildId}-${commandName}`;
          type = cooldown.type;
          break;
        case "user":
          key = `${userId}-${commandName}`;
          type = cooldown.type;
          break;
      }

      if (await this.isOnCooldown(key, cooldown.time, interaction, type)) {
        return true;
      }
    }

    return false;
  }

  private async isOnCooldown(
    key: string,
    cooldownTime: number,
    interaction: Interaction,
    type: string,
  ): Promise<boolean> {
    const onCooldown = this.cooldowns.get(key) as number | undefined;
    if (onCooldown) {
      const chatInteraction = interaction as ChatInputCommandInteraction;
      const nextUseTime = Math.ceil(onCooldown / 1000);
      await chatInteraction.reply({
        content: `You can use this command again in <t:${nextUseTime}:R> (${type} cooldown)`,
        ephemeral: true,
      });
      return true;
    }
    this.cooldowns.set(key, Date.now() + cooldownTime, cooldownTime / 1000);
    return false;
  }
}

export default InteractionCreateEvent;
