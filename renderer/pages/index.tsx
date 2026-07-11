import ListTable from '@/components/ListTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useItemStore } from '@/state';
import { Plus, Calendar, Tag as TagIcon } from 'lucide-react';
import type { Item, Tag } from '@prisma/client';
import { useState, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import TagSelector from '@/components/TagSelector';

const CONTAINER = 'mx-auto w-full max-w-5xl px-6';

export default function IndexPage() {
  const { name, setName, setCurrentItems, setTags, filterDate, setFilterDate, filterTagId, setFilterTagId, getAllTags } = useItemStore();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (_: unknown, args: Item[]) => setCurrentItems(args);
    const handleError = (_: unknown, error: { message: string }) => {
      console.error('IPC Error:', error.message);
      if (error.message.includes('Unique constraint')) {
        alert('A record with this name already exists.');
      }
    };
    const handleTags = (_: unknown, tags: Tag[]) => {
      setTags(tags);
      const currentFilterTagId = useItemStore.getState().filterTagId;
      if (currentFilterTagId && !tags.some((t) => t.id === currentFilterTagId)) {
        setFilterTagId(null);
      }
    };
    (window as any).electron.startListening(handleMessage, 'listed');
    (window as any).electron.startListening(handleError, 'error');
    (window as any).electron.startListening(handleTags, 'tagsListed');
    // ponytail: initial load via searchWithDate (no filter = all items), avoids race with listItems
    (window as any).electron.searchWithDate({ name: name || undefined, date: filterDate || undefined, tagId: filterTagId || undefined });
    getAllTags();
    return () => {
      (window as any).electron.stopListening(handleMessage, 'listed');
      (window as any).electron.stopListening(handleError, 'error');
      (window as any).electron.stopListening(handleTags, 'tagsListed');
    };
  }, []);

  useEffect(() => {
    clearTimeout(searchTimerRef.current!);
    searchTimerRef.current = setTimeout(() => {
      (window as any).electron.searchWithDate({ name: name || undefined, date: filterDate || undefined, tagId: filterTagId || undefined });
    }, 150);
  }, [name, filterDate, filterTagId]);

  const searchParams = {
    name: undefined as string | undefined,
    date: filterDate || undefined,
    tagId: filterTagId || undefined,
  };

  const addItem = () => {
    if (!name) return;
    const capturedName = name;
    (window as any).electron.addItem({
      name: capturedName,
      tagIds: filterTagId ? [filterTagId] : undefined,
      search: searchParams,
    });
    setName('');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div
        className={`${CONTAINER} overflow-y-auto min-h-0 pb-4`}
      >
        <div className="flex items-center justify-between gap-2 my-4">
          <div className="flex items-center gap-2">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant={filterDate ? 'default' : 'outline'} size="icon" className="shrink-0">
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-3" align="start">
                <DayPicker
                  mode="single"
                  selected={filterDate || undefined}
                  onSelect={(d) => { setDatePickerOpen(false); if (d) setFilterDate(d); }}
                  defaultMonth={filterDate || undefined}
                  classNames={{
                    day_button: 'p-2 h-9 w-9 rounded-md text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground',
                  }}
                />
                <style>{`
                  .rdp-button_next, .rdp-button_previous {
                    color: hsl(var(--muted-foreground)) !important;
                  }
                  .rdp-button_next:hover, .rdp-button_previous:hover {
                    background-color: hsl(var(--muted)) !important;
                  }
                `}</style>
                {filterDate && (
                  <Button variant="ghost" size="sm" onClick={() => { setFilterDate(null); (window as any).electron.searchWithDate({ name: name || undefined, tagId: filterTagId || undefined }); }} className="w-full h-7 text-xs mt-1">
                    Clear Date
                  </Button>
                )}
              </PopoverContent>
            </Popover>
            {filterDate && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterDate(null); (window as any).electron.searchWithDate({ name: name || undefined, tagId: filterTagId || undefined }); }} className="shrink-0 text-xs">
                Clear Date
              </Button>
            )}
            <TagSelector
              selectedTagIds={filterTagId ? [filterTagId] : []}
              onTagIdsChange={(tagIds) => {
                setFilterTagId(tagIds[0] || null);
              }}
              searchParams={{ name: name || undefined, date: filterDate || undefined, tagId: filterTagId || undefined }}
              variant="filter"
              trigger={
                <Button variant={filterTagId ? 'default' : 'outline'} size="icon" className="shrink-0">
                  <TagIcon className="h-4 w-4" />
                </Button>
              }
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Input
              className="w-full"
              placeholder="Search or enter new record"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
            />
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              size="icon"
              onClick={addItem}
              disabled={!name}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ListTable />
      </div>
      <div
        className={`border-t bg-background ${CONTAINER}`}
        style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% - 60px)', borderBottom: 'none' }}
      >
        <Pagination />
      </div>
    </div>
  );
}
