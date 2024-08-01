import mongoose, { Mongoose } from "mongoose";
class Database extends Mongoose {
  private static Instance: Database;
  constructor() {
    super();
  }

  static getInstance(): Database {
    if (!this.Instance) {
      this.Instance = new Database();
    }
    return this.Instance;
  }

  public async connectToDB(): Promise<void> {
    const mongoToken: string = process.env.MONGO_TOKEN;

    if (!mongoToken) {
      console.log("[DB] Invalid mongo token");
      return;
    }

    await mongoose
      .connect(mongoToken, {})
      .then(() => {
        console.log("[DB] Connected to DB [Center-Bot]");
      })
      .catch(async (err) => {
        console.log(`[DB] Error ${err}`);
      });
  }
}

export default Database;
