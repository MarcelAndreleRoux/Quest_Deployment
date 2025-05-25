// lib/types.ts
import { DateRange } from "react-day-picker";

export type Hint = {
  description: string;
  displayAfterAttempts: number;
  displayedHint?: boolean;
};

export type HintDisplayMode = "sequential" | "random";

export interface ArtifactDetails {
  created: string;
  origin: string;
  currentLocation: string;
  dimensions: string;
  materials: string;
}

export type ComponentData = {
  id: string;
  type: "heading" | "paragraph" | "image" | "restoration" | "details";
  content: string | ImageContent | RestorationContent | ArtifactDetails;
  image?: string;
  order?: number;
};

export type ImageContent = {
  url: string;
  points: Array<{
    id: string;
    x: number;
    y: number;
    text: string;
  }>;
};

export type RestorationContent = {
  restorations: Array<{
    id: string;
    name: string;
    date: string | "unknown";
    description: string;
    imageUrl: string;
    organization?: string;
  }>;
};

export type Artefact = {
  id: string;
  name: string;
  artist?: string;
  date?: string;
  description: string;
  image: File | string;
  components: ComponentData[];
  createdAt: string;
  partOfQuest: string[];
  group?: string;  // Making it optional to maintain backward compatibility
};

export type QuestArtefact = {
  artefactId: string;
  name?: string;
  hints: Hint[];
  hintDisplayMode: HintDisplayMode;
};

export type Quest = {
  quest_id: string;
  title: string;
  description: string;
  artefacts: QuestArtefact[];
  questType: "sequential" | "concurrent";
  dateRange?: DateRange;
  prize?: {
    title: string;
    description: string;
    image?: string;
    imagePreview?: string;
  };
  createdAt: string;
};
