import mongoose, { Schema, Document, Model } from "mongoose";

interface ISuspect {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relationshipToVictim: string;
  personality: string;
  motive: string;
  alibi: string;
  secrets: string[];
  statements: string[];
}

interface ILocation {
  id: string;
  name: string;
  description: string;
  discoverableDetails: string[];
}

interface IEvidence {
  id: string;
  name: string;
  description: string;
  locationId: string;
  hiddenTruth: {
    significance: string;
    relatedSuspects: string[];
    contradicts: string[];
  };
}

interface ITimelineEvent {
  id: string;
  time: string;
  description: string;
  actorId: string;
  locationId: string;
}

interface IRelationship {
  from: string;
  to: string;
  type: string;
  description: string;
}

export interface ICase extends Document {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  setting: string;

  crime: {
    type: string;
    location: string;
    date: string;
    time: string;
    description: string;
  };

  victim: {
    name: string;
    age: number;
    occupation: string;
    description: string;
  };

  suspects: ISuspect[];
  locations: ILocation[];
  evidence: IEvidence[];
  timeline: ITimelineEvent[];
  relationships: IRelationship[];

  solution: {
    culpritId: string;
    motive: string;
    method: string;
    opportunity: string;
    reasoning: string[];
    requiredEvidence: string[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "expert"],
      required: true,
    },

    setting: {
      type: String,
      required: true,
    },

    crime: {
      type: {
        type: String,
        required: true,
      },
      location: {
        type: String,
        required: true,
      },
      date: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },

    victim: {
      name: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      occupation: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },

    suspects: [
      {
        id: String,
        name: String,
        age: Number,
        occupation: String,
        relationshipToVictim: String,
        personality: String,
        motive: String,
        alibi: String,
        secrets: [String],
        statements: [String],
      },
    ],

    locations: [
      {
        id: String,
        name: String,
        description: String,
        discoverableDetails: [String],
      },
    ],

    evidence: [
      {
        id: String,
        name: String,
        description: String,
        locationId: String,

        hiddenTruth: {
          significance: String,
          relatedSuspects: [String],
          contradicts: [String],
        },
      },
    ],

    timeline: [
      {
        id: String,
        time: String,
        description: String,
        actorId: String,
        locationId: String,
      },
    ],

    relationships: [
      {
        from: String,
        to: String,
        type: String,
        description: String,
      },
    ],

    solution: {
      culpritId: {
        type: String,
        required: true,
      },

      motive: {
        type: String,
        required: true,
      },

      method: {
        type: String,
        required: true,
      },

      opportunity: {
        type: String,
        required: true,
      },

      reasoning: [String],

      requiredEvidence: [String],
    },
  },
  {
    timestamps: true,
  }
);

// const Case: Model<ICase> =
//   mongoose.models.Case || mongoose.model<ICase>("Case", CaseSchema);

if (mongoose.models.Case) {
  delete mongoose.models.Case;
}

const Case: Model<ICase> = mongoose.model<ICase>(
  "Case",
  CaseSchema
);

// export default Case;

export default Case;