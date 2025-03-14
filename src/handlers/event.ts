import fs from "fs";
import path from "path";

import BotClient from "../client";
import { IEvent } from "../interfaces/IEvent";

class EventHandler {
  private instance: BotClient;
  private events: IEvent[];
  constructor(instance: BotClient) {
    this.instance = instance;
    this.events = [];
  }
  public async handleEvents(): Promise<void> {
    try {
      const eventFolders: string[] = fs.readdirSync(path.join(__dirname, "../events"));

      for (const folder of eventFolders) {
        const eventFiles: string[] = fs.readdirSync(path.join(__dirname, `../events/${folder}`));

        for (const file of eventFiles) {
          const fullPath = path.join(__dirname, `../events/${folder}`, file);
          const eventModule = await import(fullPath);
          const event: IEvent = new eventModule.default();
          this.events.push(event);

          if (event.once) {
            this.instance.once(event.name, (...args) => event.execute(this.instance, ...args));
          } else {
            this.instance.on(event.name, (...args) => event.execute(this.instance, ...args));
          }
        }
      }
      console.log(`[CL] Successfully registered ${this.events.length} global events`);
    } catch (err) {
      console.error("[CL] Error registering global events", err);
    }
  }
}
export default EventHandler;
