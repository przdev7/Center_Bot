import "dotenv/config";
import { Client, Collection, Partials, GatewayIntentBits, ActivityType } from "discord.js";
import CommandHandler from "./handlers/command";
import EventHandler from "./handlers/event";
import { ICommand } from "./interfaces/ICommand";
import Database from "./utils/database";
import { ProcessErrorHandler } from "./handlers/processError";
import validateEnv from "./functions/validateEnv";
import statistics from "./functions/statistics";

class BotClient extends Client {
  private static Instance: BotClient;
  private commandHandler: CommandHandler;
  private eventHandler: EventHandler;
  private processErrorHandler: ProcessErrorHandler;
  private db: Database;
  public userState: Collection<string, string>;
  public commands: Collection<string, ICommand>;
  public globalCooldown: Collection<string, Collection<string, number>>;
  public userCooldown: Collection<string, Collection<string, number>>;

  private constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildEmojisAndStickers,
      ],
      partials: [Partials.User, Partials.Message, Partials.Reaction, Partials.GuildMember],
      presence: {
        status: "online",
        activities: [{ name: "👀 Use /set-status", type: ActivityType.Listening }],
      },
    });
    this.db = Database.getInstance();
    this.commands = new Collection();
    this.globalCooldown = new Collection();
    this.userCooldown = new Collection();
    this.userState = new Collection();
    this.commandHandler = new CommandHandler(this);
    this.eventHandler = new EventHandler(this);
    this.processErrorHandler = new ProcessErrorHandler(this);
  }

  static getInstance(): BotClient {
    if (!this.Instance) {
      this.Instance = new BotClient();
    }
    return this.Instance;
  }

  public async run(): Promise<void> {
    try {
      validateEnv();

      await Promise.all([
        this.processErrorHandler.registerHandlers(),
        this.commandHandler.handleCommands(),
        this.eventHandler.handleEvents(),
        this.db.connectToDB(),
        statistics(),
      ]);
      await this.login(process.env.TOKEN);
    } catch (err) {
      console.log(err);
    }
  }
}

export default BotClient;
