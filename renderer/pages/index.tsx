import Dialog from '@/components/AlertDialog';
import Layout from '@/components/Layout';
import ListTable from '@/components/ListTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Item } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

export default function IndexPage() {
  const [item, setItem] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const handleMessage = useCallback((_event, args) => {
    setItems(args);
  }, []);

  useEffect(() => {
    window.electron.startListening(handleMessage, 'listed');

    window.electron.listItems();

    return () => {
      window.electron.stopListening(handleMessage, 'listed');
    };
  }, [handleMessage]);

  useEffect(() => {
    window.electron.searchItem(item);
  }, [item]);

  const handleOk = () => {
    window.electron.addItem(item);
    setItem('');
  };

  const addItem = () => {
    setOpen(true);
  };

  return (
    <Layout>
      <div className="container py-4 space-y-4">
        <div className="flex space-x-2 w-1/2">
          <Input
            placeholder="Enter item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />

          <Button variant="default" onClick={addItem}>
            Add
          </Button>
        </div>

        <ListTable items={items} />

        <Dialog open={open} setOpen={setOpen} onOk={handleOk} />
      </div>
    </Layout>
  );
}
