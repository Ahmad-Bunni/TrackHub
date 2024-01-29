import ListTable from '@/components/ListTable';
import Pagination from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { useEventListener } from '@/renderer/hooks';
import { useItemStore } from '@/renderer/state';
import { PlusIcon } from '@radix-ui/react-icons';
import { KeyboardEvent, useEffect } from 'react';

export default function IndexPage() {
  const { name, setName } = useItemStore();
  useEventListener();

  useEffect(() => {
    window.electron.searchItem(name);
  }, [name]);

  const addItem = () => {
    window.electron.addItem(name);
    setName('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <div className="container py-4 space-y-4">
      <div className="flex space-x-2">
        <Input
          className="w-1/3"
          placeholder="Search or enter new record"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Button
          variant="outline"
          size="icon"
          onClick={addItem}
          disabled={!name}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <ListTable />

        <Pagination />
      </div>

      <Toaster />
    </div>
  );
}
