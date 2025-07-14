import type { Video } from "@muxit/models/video";

export type TimelineProps = {
  videos: Video[];
  onReorder: (newOrder: Video[]) => void;
};
