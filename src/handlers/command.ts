import "dotenv/config";

import { REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";

import BotClient from "../client";
import { ICommand } from "../interfaces/ICommand";

class CommandHandler {
  private instance: BotClient;
  private rest: REST;
  constructor(instance: BotClient) {
    this.instance = instance;
    this.rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  }

  public async handleCommands(): Promise<void> {
    try {
      const commandsFolder: string[] = fs.readdirSync(path.resolve(__dirname, "../commands"));

      for (const folder of commandsFolder) {
        const commandFiles = fs
          .readdirSync(path.join(__dirname, `../commands/${folder}`))
          .filter((file) => file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts"));

        for (const file of commandFiles) {
          const fullPath = path.join(
            __dirname,
            `../commands/${folder}`,
            process.env.NODE_ENV === "production" ? file.replace(".ts", ".js") : file,
          );
          const commandModule = await import(fullPath);
          const command: ICommand = new commandModule.default();
          this.instance.commands.set(command.slashCommandJSON.name, command);
        }
      }

      const globalCommands = this.instance.commands.filter(
        (command) => command.slashCommandConfig === undefined || command.slashCommandConfig.dev === false,
      );

      const devCommands = this.instance.commands.filter(
        (command) => command.slashCommandConfig && command.slashCommandConfig.dev === true,
      );

      await this.rest.put(Routes.applicationCommands(process.env.BOT_ID), {
        body: globalCommands.map((command) => command.slashCommandJSON.toJSON()),
      });

      await this.rest.put(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.DEV_GUILD), {
        body: devCommands.map((command) => command.slashCommandJSON.toJSON()),
      });

      console.log(
        `[CL] Successfully registered ${globalCommands.size} global & ${devCommands.size} dev application (/) commands`,
      );
    } catch (err) {
      console.error("[CL] Error registering application (/) commands", err);
    }
  }
}

export default CommandHandler;
