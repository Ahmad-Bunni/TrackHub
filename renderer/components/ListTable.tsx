import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Item } from '@prisma/client';
import { useState } from 'react';
import Dialog from './AlertDialog';
import { Button } from './ui/button';

const ListTable = ({ currentItems }: { currentItems: Item[] }) => {
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentItem] = useState<number>();

  const handleConfirm = () => {
    window.electron.removeItem(currentId);
  };

  const onDelete = (id: number) => {
    setCurrentItem(id);
    setOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{new Date(item.date).toDateString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  onClick={() => {
                    onDelete(item.id);
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        text="Delete Item?"
        open={open}
        setOpen={setOpen}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default ListTable;
