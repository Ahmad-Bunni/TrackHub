import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useItemStore } from '@/state';
import { useState, useEffect } from 'react';
import { PlusIcon, X } from 'lucide-react';

type SearchPayload = {
  name?: string | null;
  date?: Date | number | string | null;
  tagId?: number | null;
};

const TAG_COLORS = [
  '#0a7dca', '#5c1ac1', '#e83e8c', '#ff6348',
  '#ffa502', '#2ed573', '#1e90ff', '#ff4757',
  '#5352ed', '#2f3542', '#70a1ff', '#eccc68',
];

interface TagSelectorProps {
  selectedTagIds: number[];
  onTagIdsChange: (tagIds: number[]) => void;
  trigger?: React.ReactNode;
  variant?: 'add' | 'filter' | 'inline';
  searchParams?: SearchPayload;
}

const TagSelector = ({ selectedTagIds, onTagIdsChange, trigger, variant = 'add', searchParams }: TagSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [localSelected, setLocalSelected] = useState<number[]>(selectedTagIds);

  const tags = useItemStore((s) => s.tags);

  useEffect(() => {
    if (open) {
      setLocalSelected([...selectedTagIds]);
      setNewTagName('');
    }
  }, [open, selectedTagIds]);

  useEffect(() => {
    if (open) {
      useItemStore.getState().getAllTags();
    }
  }, [open]);

  const toggleTag = (tagId: number) => {
    const next = localSelected.includes(tagId)
      ? localSelected.filter(id => id !== tagId)
      : [...localSelected, tagId];
    setLocalSelected(next);
    onTagIdsChange(next);
  };

  const selectFilterTag = (tagId: number) => {
    const next = localSelected.includes(tagId) ? [] : [tagId];
    setLocalSelected(next);
    onTagIdsChange(next);
  };

  const deleteTag = (tagId: number) => {
    const next = localSelected.filter(id => id !== tagId);
    setLocalSelected(next);
    onTagIdsChange(next);
    const updatedSearch = searchParams?.tagId === tagId
      ? { ...searchParams, tagId: undefined }
      : searchParams;
    (window as any).electron.deleteTag(tagId, updatedSearch);
  };

  const createTag = () => {
    if (!newTagName.trim()) return;
    (window as any).electron.createTag({ name: newTagName, color: newTagColor });
    setNewTagName('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Tag
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 grid gap-3" align="start">
        <div className="text-xs font-medium text-muted-foreground">
          {variant === 'filter' ? 'Filter by tag' : 'Add tags to item'}
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
          {tags.map(tag => (
            variant === 'filter' ? (
              <div
                key={tag.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                  localSelected.includes(tag.id) ? 'text-white' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: localSelected.includes(tag.id) ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: localSelected.includes(tag.id) ? '#fff' : tag.color,
                }}
              >
                <button
                  onClick={() => selectFilterTag(tag.id)}
                  className="cursor-pointer"
                >
                  {tag.name}
                </button>
                <span className="text-gray-400 select-none">|</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTag(tag.id);
                  }}
                  className="cursor-pointer hover:opacity-80 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#fff', minWidth: '16px', width: '16px', height: '16px' }}
                >
                  <X className="h-3 w-3 text-gray-800" />
                </button>
              </div>
            ) : (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                  localSelected.includes(tag.id) ? 'text-white' : 'opacity-60'
                }`}
                style={{
                  backgroundColor: localSelected.includes(tag.id) ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: localSelected.includes(tag.id) ? '#fff' : tag.color,
                }}
              >
                {tag.name}
              </button>
            )
          ))}
        </div>

        <hr className="border-border" />
        <div className="pt-2 space-y-2">
          <div className="text-xs font-medium">New tag</div>
          <div className="flex gap-1.5">
            <Input
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createTag(); }}
              className="h-7 text-xs flex-1"
            />
            <div className="flex gap-0.5">
              {TAG_COLORS.slice(0, 6).map(color => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    newTagColor === color ? 'scale-125' : ''
                  }`}
                  style={{ backgroundColor: color, borderColor: newTagColor === color ? 'currentColor' : '#ccc' }}
                />
              ))}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={createTag}
            disabled={!newTagName.trim()}
            className="h-7 text-xs w-full gap-1"
          >
            <PlusIcon className="h-3 w-3" />
            Create
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TagSelector;
