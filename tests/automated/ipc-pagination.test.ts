/**
 * Test: IPC Pagination Logic
 * 
 * Tests the core pagination and search logic without requiring Electron/Prisma.
 * Validates:
 * - Date filtering with local date string matching
 * - Name filtering with startsWith
 * - Tag filtering logic
 * - Pagination slicing (ITEMS_PER_PAGE = 10)
 * - Edge cases (empty results, last page, page reset)
 */

import { describe, it, expect } from 'bun:test';

// Simulate the queryItems logic from ipc-handlers.ts
type Item = {
  id: number;
  name: string;
  date: string; // ISO date string
  tags: { tagId: number }[];
};

type SearchParams = {
  name?: string | null;
  date?: Date | string | null;
  tagId?: number | null;
};

const ITEMS_PER_PAGE = 10;

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function queryItems(items: Item[], params?: SearchParams): Item[] {
  const { name, date, tagId } = params || {};
  let filtered = [...items];

  if (name) {
    filtered = filtered.filter(item => item.name.toLowerCase().startsWith(name.toLowerCase()));
  }

  if (tagId) {
    filtered = filtered.filter(item => item.tags.some(t => t.tagId === tagId));
  }

  if (date) {
    const d = date instanceof Date ? date : new Date(date);
    const localDateStr = toLocalDateStr(d);
    filtered = filtered.filter(item => toLocalDateStr(new Date(item.date)) === localDateStr);
  }

  return filtered;
}

function paginate(items: Item[], page: number): Item[] {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return items.slice(start, end);
}

function getTotalPages(items: Item[]): number {
  return Math.ceil(items.length / ITEMS_PER_PAGE) || 1;
}

// Generate test data
function generateTestItems(count: number = 25): Item[] {
  const items: Item[] = [];
  const tags = [1, 2, 3];
  
  for (let i = 1; i <= count; i++) {
    // Spread items across different dates and tags
    const day = ((i - 1) % 28) + 1;
    const month = Math.floor((i - 1) / 28) + 1;
    const date = new Date(2024, month - 1, day);
    
    items.push({
      id: i,
      name: `Item ${i}`,
      date: date.toISOString(),
      tags: [{ tagId: tags[(i - 1) % tags.length] }],
    });
  }
  
  return items;
}

describe('IPC Pagination Logic', () => {
  const allItems = generateTestItems(25);
  
  describe('Basic pagination', () => {
    it('should return first 10 items on page 1', () => {
      const page1 = paginate(allItems, 1);
      expect(page1).toHaveLength(10);
      expect(page1[0].id).toBe(1);
      expect(page1[9].id).toBe(10);
    });
    
    it('should return items 11-20 on page 2', () => {
      const page2 = paginate(allItems, 2);
      expect(page2).toHaveLength(10);
      expect(page2[0].id).toBe(11);
      expect(page2[9].id).toBe(20);
    });
    
    it('should return remaining items on last page', () => {
      const page3 = paginate(allItems, 3);
      expect(page3).toHaveLength(5);
      expect(page3[0].id).toBe(21);
      expect(page3[4].id).toBe(25);
    });
    
    it('should calculate correct total pages', () => {
      expect(getTotalPages(allItems)).toBe(3); // 25 items / 10 per page = 3 pages
    });
    
    it('should return 1 page for empty results', () => {
      expect(getTotalPages([])).toBe(1);
    });
    
    it('should return 1 page for exactly 10 items', () => {
      expect(getTotalPages(allItems.slice(0, 10))).toBe(1);
    });
  });
  
  describe('Name filtering', () => {
    it('should filter by name prefix', () => {
      const filtered = queryItems(allItems, { name: 'Item 1' });
      // Should match Item 1, Item 10, Item 11, Item 12, ... Item 19
      expect(filtered).toHaveLength(11); // Item 1 + Item 10-19
      expect(filtered.every(item => item.name.startsWith('Item 1'))).toBe(true);
    });
    
    it('should be case-insensitive', () => {
      const filteredLower = queryItems(allItems, { name: 'item 1' });
      const filteredUpper = queryItems(allItems, { name: 'ITEM 1' });
      expect(filteredLower).toHaveLength(filteredUpper.length);
    });
    
    it('should return empty for non-matching name', () => {
      const filtered = queryItems(allItems, { name: 'nonexistent' });
      expect(filtered).toHaveLength(0);
    });
    
    it('should return all items when name is empty', () => {
      const filtered = queryItems(allItems, { name: '' });
      expect(filtered).toHaveLength(allItems.length);
    });
  });
  
  describe('Date filtering', () => {
    it('should filter by exact local date', () => {
      // Item 1 has date 2024-01-01
      const filtered = queryItems(allItems, { date: '2024-01-01' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });
    
    it('should handle Date object input', () => {
      const dateObj = new Date(2024, 0, 15); // 2024-01-15
      const filtered = queryItems(allItems, { date: dateObj });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(item => {
        const itemDate = new Date(item.date);
        return itemDate.toISOString().startsWith('2024-01-15');
      })).toBe(true);
    });
    
    it('should filter by date in different month', () => {
      // Items 29-56 would be in month 2, but we only have 25 items
      // Item 12 is 2024-01-12
      const filtered = queryItems(allItems, { date: '2024-01-12' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(12);
    });
  });
  
  describe('Tag filtering', () => {
    it('should filter by tagId', () => {
      // Items with tagId=1: 1, 4, 7, 10, 13, 16, 19, 22, 25
      const filtered = queryItems(allItems, { tagId: 1 });
      expect(filtered).toHaveLength(9);
      expect(filtered.every(item => item.tags.some(t => t.tagId === 1))).toBe(true);
    });
    
    it('should return empty for non-existent tagId', () => {
      const filtered = queryItems(allItems, { tagId: 999 });
      expect(filtered).toHaveLength(0);
    });
  });
  
  describe('Combined filters', () => {
    it('should apply name + date filter', () => {
      // Item 1: name="Item 1", date=2024-01-01
      const filtered = queryItems(allItems, { name: 'Item 1', date: '2024-01-01' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });
    
    it('should apply name + tag filter', () => {
      // Items starting with "Item 1" AND tagId=1: Item 1, Item 10 (no, Item 10 has tagId 10%3=1? Let me check)
      // Actually: Item 1 (tag 1), Item 10 (tag 10%3=1), Item 13 (tag 13%3=1), etc.
      const filtered = queryItems(allItems, { name: 'Item 1', tagId: 1 });
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(item => item.name.startsWith('Item 1') && item.tags.some(t => t.tagId === 1))).toBe(true);
    });
    
    it('should apply all three filters', () => {
      // Item 1: name="Item 1", date=2024-01-01, tagId=1
      const filtered = queryItems(allItems, { name: 'Item 1', date: '2024-01-01', tagId: 1 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });
  });
  
  describe('Pagination after filtering (test plan scenarios)', () => {
    it('A2: search from page 2 should show page 1 results', () => {
      // Simulate: user is on page 2, types search
      const searchResults = queryItems(allItems, { name: 'Item 1' });
      // After search, page should reset to 1
      const page1Results = paginate(searchResults, 1);
      expect(page1Results).toHaveLength(Math.min(10, searchResults.length));
    });
    
    it('A3: narrow search should fit on fewer pages', () => {
      // Search for something with few results
      const searchResults = queryItems(allItems, { name: 'Item 99' }); // No matches
      expect(getTotalPages(searchResults)).toBe(1);
    });
    
    it('A4: empty results should show "1 of 1"', () => {
      const searchResults = queryItems(allItems, { name: 'zzzznonexistent' });
      expect(searchResults).toHaveLength(0);
      expect(getTotalPages(searchResults)).toBe(1);
    });
    
    it('A5: date filter should work with pagination', () => {
      const dateResults = queryItems(allItems, { date: '2024-01-01' });
      expect(dateResults).toHaveLength(1);
      expect(getTotalPages(dateResults)).toBe(1);
      expect(paginate(dateResults, 1)).toHaveLength(1);
    });
    
    it('A6: tag filter should work with pagination', () => {
      const tagResults = queryItems(allItems, { tagId: 1 });
      expect(tagResults).toHaveLength(9);
      expect(getTotalPages(tagResults)).toBe(1); // 9 items < 10
    });
  });
  
  describe('Edge cases', () => {
    it('page 0 should return empty array', () => {
      const result = paginate(allItems, 0);
      expect(result).toHaveLength(0);
    });
    
    it('page beyond total should return empty array', () => {
      const result = paginate(allItems, 100);
      expect(result).toHaveLength(0);
    });
    
    it('should handle single item', () => {
      const singleItem = [allItems[0]];
      expect(getTotalPages(singleItem)).toBe(1);
      expect(paginate(singleItem, 1)).toHaveLength(1);
    });
  });
});
