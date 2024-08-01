import "dotenv/config";
import Discord, { Client, Collection, Partials } from "discord.js";
import CommandHandler from "./handlers/command";
import EventHandler from "./handlers/event";
import { ICommand } from "./interfaces/ICommand";
import Database from "./utils/database";
import { ProcessErrorHandler } from "./handlers/processError";
import validateEnv from "./functions/validateEnv";

class BotClient extends Client {
  private static Instance: BotClient;
  private cHandler: CommandHandler;
  private eHandler: EventHandler;
  private processErrorHandler: ProcessErrorHandler;
  private db: Database;
  public userState: Collection<string, string>;
  public commands: Collection<string, ICommand>;
  public globalCooldown: Collection<string, Collection<string, number>>;
  public userCooldown: Collection<string, Collection<string, number>>;

  private constructor() {
    super({
      intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
      ],
      partials: [Partials.User, Partials.Message, Partials.Reaction, Partials.GuildMember],
      presence: {
        status: "online",
        activities: [{ name: "👀 Use /set-status", type: Discord.ActivityType.Listening }],
      },
    });
    this.db = Database.getInstance();
    this.commands = new Collection();
    this.globalCooldown = new Collection();
    this.userCooldown = new Collection();
    this.userState = new Collection();
    this.cHandler = new CommandHandler(this);
    this.eHandler = new EventHandler(this);
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
        this.cHandler.handleCommands(),
        this.eHandler.handleEvents(),
        this.db.connectToDB(),
      ]);
      await this.login(process.env.TOKEN);
    } catch (err) {
      console.log(err);
    }
  }
}

export default BotClient;
