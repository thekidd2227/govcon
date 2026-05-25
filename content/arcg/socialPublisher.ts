import type { SocialPublishResult } from './types';

class NotImplementedError extends Error {
  constructor(platform: string) {
    super(
      `Direct publishing to ${platform} is not implemented.\n\n` +
      `Before this can work, the following are required:\n` +
      `  - OAuth 2.0 app registration with ${platform}\n` +
      `  - Token refresh flow (access tokens expire)\n` +
      `  - Platform-specific permissions and scopes\n` +
      `  - Media upload handling (images, videos, carousels)\n` +
      `  - Rate limit management\n` +
      `  - Error handling and retry logic\n` +
      `  - Audit logging for published content\n` +
      `  - Account authorization per user/page\n\n` +
      `Use CSV export to Buffer/Metricool/Publer instead.\n` +
      `See docs/content-command-center.md for details.`
    );
    this.name = 'NotImplementedError';
  }
}

export interface SocialPublisher {
  publishToFacebook(postId: string): Promise<SocialPublishResult>;
  publishToInstagram(postId: string): Promise<SocialPublishResult>;
  publishToLinkedIn(postId: string): Promise<SocialPublishResult>;
}

export class ARCGSocialPublisher implements SocialPublisher {
  async publishToFacebook(_postId: string): Promise<SocialPublishResult> {
    throw new NotImplementedError('Facebook/Meta');
  }

  async publishToInstagram(_postId: string): Promise<SocialPublishResult> {
    throw new NotImplementedError('Instagram/Meta');
  }

  async publishToLinkedIn(_postId: string): Promise<SocialPublishResult> {
    throw new NotImplementedError('LinkedIn');
  }
}
