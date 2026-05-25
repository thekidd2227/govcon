import type { ContentPost } from './types';

function escapeCSV(value: string): string {
  if (!value) return '';
  const needsQuoting = value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r');
  if (needsQuoting) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function toRow(cells: string[]): string {
  return cells.map(escapeCSV).join(',');
}

export function exportToCSV(posts: ContentPost[], format: 'master' | 'buffer' | 'metricool'): string {
  const headers = ['Date', 'Time', 'Platform', 'Caption', 'Media Prompt', 'Video Prompt', 'CTA', 'Hashtags', 'Status', 'Notes'];

  if (format === 'buffer') headers.push('Publish');
  if (format === 'metricool') headers.push('Channel');

  const rows = [toRow(headers)];

  for (const p of posts) {
    const cells = [
      p.date,
      p.recommendedTime,
      p.platform,
      p.caption,
      p.imagePrompt,
      p.videoPrompt || '',
      p.cta,
      (p.hashtags || []).join(' '),
      p.status,
      p.notes || '',
    ];

    if (format === 'buffer') {
      cells.push(p.status === 'approved' || p.status === 'scheduled' ? 'Yes' : 'No');
    }
    if (format === 'metricool') {
      const channelMap: Record<string, string> = {
        linkedin: 'LinkedIn',
        instagram: 'Instagram',
        facebook: 'Facebook',
      };
      cells.push(channelMap[p.platform] || p.platform);
    }

    rows.push(toRow(cells));
  }

  return rows.join('\n') + '\n';
}
