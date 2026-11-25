
const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "email",
        "number",
        "phone",
        "textarea",
        "date",
        "select",
        "radio",
        "checkbox",
      ],
    },

    placeholder: {
      type: String,
      default: "",
    },

    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    required: {
      type: Boolean,
      default: false,
    },

    options: {
      type: [String],
      default: [],
    },

    minLength: {
      type: Number,
    },

    maxLength: {
      type: Number,
    },

    min: {
      type: Number,
    },

    max: {
      type: Number,
    },
  },
  { _id: true }
);

const formSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    fields: {
      type: [fieldSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
