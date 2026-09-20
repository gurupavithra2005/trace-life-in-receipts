/**
 * Lightweight, zero-dependency browser-side parsers for CSV, TSV, JSON, and XML files.
 * Never uses eval() or new Function(). Untrusted input is strictly parsed.
 */

export function parseDelimitedText(text: string, delimiter: string = ','): Record<string, string>[] {
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length < 2) return [];

  // Parse header line
  const parseRow = (line: string): string[] => {
    const row: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          entry += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    return row;
  };

  const headers = parseRow(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
  if (headers.length === 0) return [];

  const results: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const values = parseRow(lines[i]);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      const val = values[j] !== undefined ? values[j].replace(/^["']|["']$/g, '').trim() : '';
      obj[headers[j]] = val;
    }
    results.push(obj);
  }

  return results;
}

export function parseCSV(text: string): Record<string, string>[] {
  return parseDelimitedText(text, ',');
}

export function parseTSV(text: string): Record<string, string>[] {
  return parseDelimitedText(text, '\t');
}

export function parseJSON(text: string): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (typeof parsed === 'object' && parsed !== null) {
      // If object with key containing list (e.g. { data: [...] } or { transactions: [...] })
      for (const key of Object.keys(parsed)) {
        if (Array.isArray(parsed[key])) {
          return parsed[key];
        }
      }
      return [parsed];
    }
    return [];
  } catch {
    return [];
  }
}

export function parseXML(xmlText: string): Record<string, string>[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('XML parse notice: malformed content detected');
      return [];
    }

    // Look for repeating row elements: <record>, <transaction>, <item>, <row>
    const potentialTagNames = ['record', 'transaction', 'item', 'row', 'transact'];
    let elements: Element[] = [];

    for (const tag of potentialTagNames) {
      const found = Array.from(doc.getElementsByTagName(tag));
      if (found.length > 0) {
        elements = found;
        break;
      }
    }

    if (elements.length === 0 && doc.documentElement) {
      elements = Array.from(doc.documentElement.children);
    }

    const results: Record<string, string>[] = [];
    for (const el of elements) {
      const record: Record<string, string> = {};
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        record[child.tagName] = child.textContent?.trim() || '';
      }
      if (Object.keys(record).length > 0) {
        results.push(record);
      }
    }
    return results;
  } catch {
    return [];
  }
}
