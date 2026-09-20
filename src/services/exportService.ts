/**
 * TRACE Export Service
 * Enables client-side data export in multiple formats:
 * - Formatted Markdown Life Story Report
 * - Machine-readable Normalized JSON
 * - Tabular CSV
 */

import { LifeChapter } from '../types/chapters';
import { ConnectedCluster } from '../types/connections';
import { DetectedPattern } from '../types/patterns';
import { Receipt } from '../types/receipt';

export class ExportService {
  /**
   * Generates an evocative Markdown narrative of the user's life story.
   */
  public static generateMarkdownStory(
    receipts: Receipt[],
    chapters: LifeChapter[],
    patterns: DetectedPattern[],
    clusters: ConnectedCluster[]
  ): string {
    const totalMoments = receipts.length;
    const spotifyCount = receipts.filter(r => r.type === 'MUSIC' || r.source === 'spotify').length;
    const financialCount = totalMoments - spotifyCount;

    const timestamps = receipts.map(r => new Date(r.timestamp).getTime()).filter(t => !isNaN(t));
    const earliestDate = timestamps.length > 0 ? new Date(Math.min(...timestamps)).toLocaleDateString() : 'N/A';
    const latestDate = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toLocaleDateString() : 'N/A';

    let md = `# 🧾 TRACE — Your Life, In Receipts: Story Report\n\n`;
    md += `> Generated on ${new Date().toLocaleDateString()} | Timespan: ${earliestDate} to ${latestDate}\n\n`;
    md += `## 📊 Story Statistics\n\n`;
    md += `- **Total Tracked Moments:** ${totalMoments.toLocaleString()}\n`;
    md += `- **Listening Traces:** ${spotifyCount.toLocaleString()} songs & podcasts\n`;
    md += `- **Transactional Traces:** ${financialCount.toLocaleString()} purchases & bills\n`;
    md += `- **Co-Occurring Story Clusters:** ${clusters.length.toLocaleString()}\n`;
    md += `- **Life Chapters Identified:** ${chapters.length}\n\n`;

    md += `## 📖 Life Chapters\n\n`;
    chapters.forEach((ch, idx) => {
      md += `### Chapter ${idx + 1}: ${ch.title} (${ch.timeRange})\n\n`;
      md += `${ch.summary}\n\n`;
      md += `- **Dominant Focus:** ${ch.dominantActivity}\n`;
      md += `- **Moments in Chapter:** ${ch.keyMomentReceiptIds.length}\n`;
      md += `- **Connected Story Moments:** ${ch.connectedMomentsCount}\n`;
      if (ch.evidence) {
        md += `- **Evidence:** ${ch.evidence}\n`;
      }
      md += `\n`;
    });

    md += `## 🧬 Behavioral Patterns Detected\n\n`;
    patterns.forEach(p => {
      md += `- **${p.title}** [${p.category}]: ${p.summary}\n`;
      md += `  *Confidence:* ${Math.round(p.confidence * 100)}% | *Timeframe:* ${p.timeframe}\n`;
    });
    md += `\n`;

    md += `---\n`;
    md += `*Generated entirely in-browser by TRACE. No private credentials or personal records were transmitted externally.*`;

    return md;
  }

  /**
   * Generates a clean CSV file from normalized receipts.
   */
  public static generateCSV(receipts: Receipt[]): string {
    const headers = ['id', 'timestamp', 'type', 'source', 'title', 'subtitle', 'amount', 'currency', 'city'];
    const rows = receipts.map(r => {
      const ts = r.timestamp || '';
      const cat = (r.metadata?.category as string) || (r.tags && r.tags[0]) || 'General';
      const city = r.location?.city || '';
      return [
        r.id,
        ts,
        r.type,
        r.source,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.subtitle || cat || '').replace(/"/g, '""')}"`,
        r.amount !== undefined ? r.amount.toString() : '',
        r.currency || '',
        `"${city.replace(/"/g, '""')}"`,
      ];
    });

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Generates a structured JSON string.
   */
  public static generateJSON(receipts: Receipt[]): string {
    return JSON.stringify(receipts, null, 2);
  }

  /**
   * Initiates browser download of text/data content.
   */
  public static downloadFile(content: string, filename: string, mimeType: string): void {
    if (typeof document === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
