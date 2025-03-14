import { model, Schema } from "mongoose";

export interface Devs {
  devs: string[];
}

const devsSchema = new Schema<Devs>(
  {
    devs: { type: [String], required: [true, "developersIds is required"] },
  },
  { collection: "devs" },
);

export default model("devsModel", devsSchema);
