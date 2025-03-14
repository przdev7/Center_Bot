declare namespace NodeJS {
  export interface ProcessEnv {
    TOKEN: string;
    // CLIENT_SECRET: string;
    NODE_ENV: "dev" | "production";
    BOT_ID: string;
    DEV_GUILD: string;
    ERROR_LOG_CHANNEL: string;
    MONGO_TOKEN: string;
  }
}
