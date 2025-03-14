import { ClientEvents } from "discord.js";
import BotClient from "../client";
interface IEvent {
  name: keyof ClientEvents;
  once: boolean;
  execute(client: BotClient, ...args: unknown[]): Promise<void>;
}

export { IEvent };
