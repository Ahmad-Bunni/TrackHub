import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/renderer/Layout';
import DataView from '@/renderer/components/DataView';
import { Item } from '@prisma/client';
import { useEffect, useState } from 'react';
import useEventListener from '../hooks/useEventListener';

export default function IndexPage() {
  const [name, setName] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  useEventListener(setItems);

  useEffect(() => {
    window.electron.searchItem(name);
  }, [name]);

  const addItem = () => {
    window.electron.addItem(name);
    setName('');
  };

  return (
    <Layout>
      <div className="container py-4 space-y-4">
        <div className="flex space-x-2 w-1/2">
          <Input
            placeholder="Enter item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button variant="default" onClick={addItem} disabled={!name}>
            Add
          </Button>
        </div>

        <DataView items={items} />

        <Toaster />
      </div>
    </Layout>
  );
}
