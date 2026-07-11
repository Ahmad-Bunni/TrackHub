import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useItemStore } from '@/state';
import type { Item } from '@prisma/client';
import { useState } from 'react';
import { Pencil } from 'lucide-react';

const NoteSelector = ({ item }: { item: Item }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const name = useItemStore((s) => s.name);
  const filterDate = useItemStore((s) => s.filterDate);
  const filterTagId = useItemStore((s) => s.filterTagId);

  const save = () => {
    window.electron.updateNote(item.id, draft, {
      name: name || undefined,
      date: filterDate || undefined,
      tagId: filterTagId || undefined,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setDraft(item.note || ''); setOpen(o); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-5 w-5 p-0 bg-background border rounded-md hover:bg-accent">
          <Pencil className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 grid gap-2" align="start">
        <div className="text-xs font-medium">{item.note ? 'Edit Note' : 'Add Note'}</div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              save();
            }
          }}
          className="min-h-[100px] text-xs resize-none border rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-ring"
          placeholder="Enter note"
          autoFocus
        />
        <Button size="sm" className="h-7 text-xs w-full" onClick={save}>Save</Button>
      </PopoverContent>
    </Popover>
  );
};

export default NoteSelector;
