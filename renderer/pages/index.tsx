import Dialog from '@/components/AlertDialog';
import Layout from '@/components/Layout';
import ListTable from '@/components/ListTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Item } from '@prisma/client';
import { useEffect, useState } from 'react';

export default function IndexPage() {
  const [item, setItem] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const handleMessage = (_event, args) => setItems(args);

    window.electron.listItems();

    window.electron.itemsListed(handleMessage);

    return () => {
      window.electron.stopListening(handleMessage);
    };
  }, []);

  const handleOk = () => {
    window.electron.addItem(item);
    setItem('');
  };

  const addItem = () => {
    setOpen(true);
  };

  const searchItem = () => {};

  return (
    <Layout>
      <div className="container py-4 space-y-4">
        <div className="flex space-x-2 w-1/2">
          <Input
            placeholder="Enter item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />

          <Button variant="outline" onClick={searchItem}>
            Search
          </Button>

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
