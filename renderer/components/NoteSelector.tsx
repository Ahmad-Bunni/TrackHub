import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Item } from "@prisma/client";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const NoteSelector = ({
  item,
  updateNoteMutation,
}: {
  item: Item;
  updateNoteMutation: {
    mutateAsync: (vars: { id: number; note?: string }) => Promise<any>;
  };
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const save = async () => {
    await updateNoteMutation.mutateAsync({ id: item.id, note: draft });
    toast.success("Note updated", { description: "Note updated successfully" });
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setDraft(item.note || "");
        setOpen(o);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-5 w-5 p-0 bg-background border rounded-md hover:bg-accent cursor-pointer"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 grid gap-2" align="start">
        <div className="text-xs font-medium">
          {item.note ? "Edit Note" : "Add Note"}
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
          }}
          className="min-h-[100px] text-xs resize-none border rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-ring"
          placeholder="Enter note"
          autoFocus
        />
        <Button
          size="sm"
          className="h-7 text-xs w-full cursor-pointer"
          onClick={save}
        >
          Save
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default NoteSelector;
