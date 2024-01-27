import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Item } from '@prisma/client';

const ListTable = ({ items }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">ID</TableHead>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items &&
          items.map((item: Item) => (
            <TableRow>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-right">
                {new Date(item.date).toDateString()}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default ListTable;
