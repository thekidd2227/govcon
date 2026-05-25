// ARCG Content Command Center — Type Definitions
// Diagnosis-first content calendar for operational intelligence publishing

export interface ContentPost {
  id: string;
  date: string; // ISO 8601 date: YYYY-MM-DD
  platform: 'linkedin' | 'instagram' | 'facebook';
  recommendedTime: string; // HH:MM 24-hour format
  format: 'carousel' | 'reel' | 'static' | 'story' | 'text';
  audience: string; // e.g. 'small-business-owners', 'property-managers'
  theme: string; // e.g. 'Operational Waste Exposé'
  hook: string; // Scroll-stopping opener, 15-25 words, diagnosis-first
  caption: string; // 80-150 words, references specific buyer pain
  imagePrompt: string; // Visual direction for design team
  videoPrompt: string; // 10-sec cinematic direction
  cta: string; // Must be from approved CTA list
  hashtags: string[]; // 5-8 hashtags
  status: 'draft' | 'scheduled' | 'published' | 'approved';
  notes: string;
  sourceAngle: string; // Research or insight source angle
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface ContentCalendar {
  posts: ContentPost[];
  metadata: {
    generatedAt: string; // ISO date
    version: string;
    totalPosts: number;
    platforms: string[];
    dateRange: {
      start: string; // ISO date
      end: string; // ISO date
    };
  };
}

export interface ValidationResult {
  errors: {
    postId: string;
    field: string;
    message: string;
  }[];
  warnings: {
    postId: string;
    field: string;
    message: string;
  }[];
  score: number; // 0-100
}

export interface SocialPublishResult {
  success: boolean;
  platform: 'linkedin' | 'instagram' | 'facebook';
  postId: string;
  error?: string;
  publishedAt?: string; // ISO timestamp, present only when success is true
}
