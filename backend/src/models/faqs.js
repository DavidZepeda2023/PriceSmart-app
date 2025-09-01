import { Schema, model } from "mongoose";

const productsSchema = new Schema(
  {
    name: {
      type: String,
      required: true, // corregido
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true, // corregido
      min: 0,
    },
    stock: {
      type: Number,
      required: true, // corregido
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Products", productsSchema);
