
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },

    answers: {
      type: [answerSchema],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ formId: 1, createdAt: -1 });

const Submission = mongoose.model(
  "Submission",
  submissionSchema
);

module.exports = Submission;
