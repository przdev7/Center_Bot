import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { SlashCommandConfig } from "../builders/SlashCommandConfig";
import BotClient from "../client";

export type SlashCommandJSON =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder;
export interface ICommand {
  slashCommandJSON: SlashCommandJSON;
  slashCommandConfig?: SlashCommandConfig;
  execute(interaction: ChatInputCommandInteraction, client: BotClient): Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction, client: BotClient) => Promise<void>;
}
