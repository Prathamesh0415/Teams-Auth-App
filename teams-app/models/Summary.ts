import mongoose, { Schema, model, models } from "mongoose";

export interface ISummary {
  userId: string;
  url: string;
  title: string;
  summary: string;
  type: "video" | "website";
  videoDuration?: string; // Optional: Only used if type === 'video'
  createdAt: Date;
}

const SummarySchema = new Schema<ISummary>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true, 
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      index: true, 
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    summary: {
      type: String,
      required: [true, "Summary content is required"],
    },
    type: {
      type: String,
      enum: ["video", "website"],
      required: true,
    },
   
    videoDuration: {
      type: String, 
      required: false,
    },
  },
  {
    timestamps: true, 
  }
);

const Summary = models.Summary || model<ISummary>("Summary", SummarySchema);

export default Summary;