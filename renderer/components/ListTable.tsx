import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { useItemStore } from '@/state';
import type { Item, ItemTag, Tag } from '@prisma/client';
import { useState, useMemo } from 'react';
import { ITEMS_PER_PAGE } from '@/lib/utils';
import TagSelector from './TagSelector';
import NoteSelector from './NoteSelector';
import { Plus, Trash2 } from 'lucide-react';

const TagPill = ({ tag, onClick }: { tag: Tag; onClick?: () => void }) => (
  <span
    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer select-none hover:opacity-80"
    style={{ backgroundColor: tag.color + '22', color: tag.color, borderColor: tag.color + '66' }}
    onClick={onClick}
  >
    {tag.name}
  </span>
);

const ListTable = () => {
  const items = useItemStore((s) => s.items) as unknown as (Item & { tags: ItemTag[] })[];
  const tags = useItemStore((s) => s.tags);
  const page = useItemStore((s) => s.currentPage);
  const name = useItemStore((s) => s.name);
  const filterDate = useItemStore((s) => s.filterDate);
  const filterTagId = useItemStore((s) => s.filterTagId);
  const setFilterTagId = useItemStore((s) => s.setFilterTagId);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const currentItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      if (sortBy === 'name') return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      return sortAsc ? +new Date(a.date) - +new Date(b.date) : +new Date(b.date) - +new Date(a.date);
    });
    return sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [items, page, sortBy, sortAsc]);

  const toggleSort = (field: 'name' | 'date') => {
    if (sortBy === field) setSortAsc((p) => !p);
    else { setSortBy(field); setSortAsc(true); }
  };

  const handleTagFilterClick = (tagId: number) => {
    const nextTagId = filterTagId === tagId ? null : tagId;
    setFilterTagId(nextTagId);
    window.electron.searchWithDate({
      name: name || undefined,
      date: filterDate || undefined,
      tagId: nextTagId || undefined
    });
  };

  const searchParams = {
    name: name || undefined,
    date: filterDate || undefined,
    tagId: filterTagId || undefined,
  };

  const handleTagChange = (itemId: number, tagIds: number[]) => {
    window.electron.updateItemTags(itemId, tagIds, searchParams);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none text-muted-foreground hover:text-foreground underline underline-offset-2" onClick={() => toggleSort('name')}>
              Name {sortBy === 'name' && (sortAsc ? '\u25B2' : '\u25BC')}
            </TableHead>
            <TableHead className="cursor-pointer select-none text-muted-foreground hover:text-foreground underline underline-offset-2" onClick={() => toggleSort('date')}>
              Date {sortBy === 'date' && (sortAsc ? '\u25B2' : '\u25BC')}
            </TableHead>
            <TableHead className="select-none text-muted-foreground">Tag</TableHead>
            <TableHead className="select-none text-muted-foreground">Note</TableHead>
            <TableHead className="w-10 select-none" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{new Date(item.date).toDateString()}</TableCell>
                <TableCell className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map((it) => {
                      const tag = tags.find(t => t.id === it.tagId);
                      if (!tag) return null;
                      return (
                        <TagPill
                          key={it.tagId}
                          tag={tag}
                          onClick={() => handleTagFilterClick(it.tagId)}
                        />
                      );
                    })}
                    <TagSelector
                      selectedTagIds={item.tags?.map(t => t.tagId) || []}
                      onTagIdsChange={(tagIds) => handleTagChange(item.id, tagIds)}
                      variant="inline"
                      trigger={
                        <Button variant="outline" size="icon" className="h-5 w-5 p-0 bg-background border rounded-md hover:bg-accent">
                          <Plus className="h-3 w-3" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  {item.note ? (
                    <span className="text-xs text-muted-foreground truncate block" title={item.note}>{item.note}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50 italic">No note</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <NoteSelector item={item} />
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>

      {deleteId != null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-80 space-y-4">
            <p>Are you sure?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                window.electron.removeItem(deleteId, searchParams);
                setDeleteId(null);
              }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ListTable;
