import { ClientEvents } from "discord.js";
interface IEvent {
  name: keyof ClientEvents;
  once: boolean;
  execute(...args: unknown[]): Promise<void>;
}

export { IEvent };
