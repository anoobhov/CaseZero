import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGameSession extends Document {
  userId?: string;
  caseId: mongoose.Types.ObjectId;

  discoveredEvidence: string[];
  discoveredLocations: string[];
  interrogatedSuspects: string[];
  unlockedInformation: string[];

  notes: string[];

  accusation?: {
    suspectId: string;
    motive: string;
    method: string;
    reasoning: string;
    submittedAt: Date;
  };

  result?: {
    correctCulprit: boolean;
    correctMotive: boolean;
    correctMethod: boolean;
    score: number;
  };

  status: "in_progress" | "completed";

  startedAt: Date;
  completedAt?: Date;
}

const GameSessionSchema = new Schema<IGameSession>(
  {
    userId: {
      type: String,
      required: false,
    },

    caseId: {
      type: Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },

    discoveredEvidence: [String],

    discoveredLocations: [String],

    interrogatedSuspects: [String],

    unlockedInformation: [String],

    notes: [String],

    accusation: {
      suspectId: String,
      motive: String,
      method: String,
      reasoning: String,
      submittedAt: Date,
    },

    result: {
      correctCulprit: Boolean,
      correctMotive: Boolean,
      correctMethod: Boolean,
      score: Number,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

const GameSession: Model<IGameSession> =
  mongoose.models.GameSession ||
  mongoose.model<IGameSession>("GameSession", GameSessionSchema);

export default GameSession;