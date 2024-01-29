import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useItemStore } from '@/renderer/state';
import { KeyboardEvent, useState } from 'react';
import Dialog from './AlertDialog';
import { Button } from './ui/button';
const ListTable = () => {
  const { currentItems, id, setId, note, setNote } = useItemStore();
  const [deleteItemId, setDeleteItemId] = useState<number>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onConfirmDeletion = () => {
    window.electron.removeItem(deleteItemId);
  };

  const onDelete = (id: number) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      window.electron.updateNote(id, note);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{new Date(item.date).toDateString()}</TableCell>
              <TableCell>{item.note}</TableCell>
              <TableCell className="text-right space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNote(item.note);
                        setId(item.id);
                      }}
                    >
                      Add Note
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Press Enter to set the note for{' '}
                          <span className="font-bold">{item.name}</span>
                        </p>
                      </div>
                      <Input
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                          setNote(e.target.value);
                        }}
                        placeholder="Enter note"
                        className="col-span-2 h-8"
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="destructive"
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
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={onConfirmDeletion}
      />
    </>
  );
};

export default ListTable;
