import type { ContentPost, Platform } from "../types";

export interface BufferConfig {
  apiKey?: string;
  organizationId?: string;
  timezone: string;
  scheduleMode: "draft" | "schedule";
  channels: Record<Platform, string | undefined>;
}

export interface BufferOrganization {
  id: string;
  name: string;
  ownerEmail?: string;
}

export interface BufferChannel {
  id: string;
  name?: string;
  displayName?: string;
  service?: string;
  isQueuePaused?: boolean;
}

export interface BufferScheduleLog {
  postId: string;
  product: ContentPost["product"];
  platform: Platform;
  channelId: string;
  dueAt: string;
  bufferPostId: string;
  status: "scheduled";
  scheduledAt: string;
  captionHash: string;
}
