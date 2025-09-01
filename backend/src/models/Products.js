import { Schema, model } from "mongoose";

const productsSchema = new Schema(
  {
    name: {
      type: String, // 🔹 string
      required: true,
    },
    description: {  // 🔹 corregido typo de desciption
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default model("Products", productsSchema);
