import { EmbedBuilder } from "@discordjs/builders";
import { TextChannel } from "discord.js";
import { inspect } from "util";
import BotClient from "../client";

export class ProcessErrorHandler {
  private instance: BotClient;

  constructor(instance: BotClient) {
    this.instance = instance;
  }

  public registerHandlers(): void {
    process.on("warning", this.handleWarning.bind(this));
    process.on("uncaughtExceptionMonitor", this.handleUncaughtExceptionMonitor.bind(this));
    process.on("uncaughtException", this.handleUncaughtException.bind(this));
    process.on("unhandledRejection", this.handleUnhandledRejection.bind(this));
    this.instance.on("error", this.handleDiscordError.bind(this));
  }

  private async handleWarning(warning: Error): Promise<void> {
    console.warn(`Warning: ${warning.name} - ${warning.message}`);
    console.warn(warning.stack);
    await this.sendErrorLog("warning", warning, "https://nodejs.org/api/process.html#event-warning", [255, 255, 0]);
  }

  private async handleUncaughtExceptionMonitor(error: Error): Promise<void> {
    console.error("Uncaught Exception Monitor: ", error);
    await this.sendErrorLog(
      "uncaughtExceptionMonitor",
      error,
      "https://nodejs.org/api/process.html#event-uncaughtexceptionmonitor",
      [255, 0, 0],
    );
  }

  private async handleUncaughtException(error: Error): Promise<void> {
    console.error("Uncaught Exception: ", error);
    await this.sendErrorLog(
      "uncaughtException",
      error,
      "https://nodejs.org/api/process.html#event-uncaughtexception",
      [255, 0, 0],
    );
  }

  private async handleUnhandledRejection(reason: unknown): Promise<void> {
    console.error("Unhandled Rejection at:", reason);
    await this.sendErrorLog(
      "unhandledRejection",
      reason,
      "https://nodejs.org/api/process.html#event-unhandledrejection",
      [255, 0, 0],
    );
  }

  private async handleDiscordError(error: Error): Promise<void> {
    console.error(`Discord error: ${inspect(error, { depth: 0 })}`);
    await this.sendErrorLog(
      "Discord Error",
      error,
      "https://discordjs.guide/popular-topics/errors.html#api-errors",
      [255, 0, 0],
    );
  }

  private async sendErrorLog(
    title: string,
    error: unknown,
    url: string,
    color: [number, number, number],
  ): Promise<void> {
    const channelId: string = process.env.ERROR_LOG_CHANNEL;
    const errorChannel = this.instance.channels.cache.get(channelId) as TextChannel;
    if (!errorChannel) {
      console.error(`Error: Channel with ID ${channelId} not found.`);
      return;
    }

    const ErrorEmbed = new EmbedBuilder()
      .setTitle(title)
      .setURL(url)
      .setColor(color)
      .setDescription(`\`\`\`${inspect(error, { depth: 0 })}\`\`\``)
      .setTimestamp();

    try {
      await errorChannel.send({ embeds: [ErrorEmbed] });
    } catch (err) {
      console.error(`Failed to send error log: ${err}`);
    }
  }
}
