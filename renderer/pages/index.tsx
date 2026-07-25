import ListTable from "@/components/ListTable";
import Pagination from "@/components/Pagination";
import TagSelector from "@/components/TagSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buildSearchParams, updateSearchTagParam } from "@/lib/utils";
import { useItemStore } from "@/state";

import { Calendar, Plus, Tag as TagIcon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { toast } from "sonner";

const CONTAINER = "mx-auto w-full max-w-5xl px-6";

export default function IndexPage() {
  const {
    name,
    setName,
    filterDate,
    setFilterDate,
    filterTagId,
    setFilterTagId,
  } = useItemStore();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const queryClient = useQueryClient();

  // --- Queries ---

  const itemsQuery = useQuery({
    queryKey: ["items", name, filterDate, filterTagId],
    queryFn: () =>
      window.electron.searchWithDate({
        name: name || undefined,
        date: filterDate || undefined,
        tagId: filterTagId || undefined,
      }),
  });

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: () => window.electron.getAllTags(),
  });

  // --- Mutations ---

  const addItemMutation = useMutation({
    mutationFn: (payload: { name: string; tagIds?: number[] }) =>
      window.electron.addItem({
        ...payload,
        search: buildSearchParams({
          name: name || undefined,
          date: filterDate || undefined,
          tagId: filterTagId || undefined,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: number) =>
      window.electron.removeItem(
        id,
        buildSearchParams({
          name: name || undefined,
          date: filterDate || undefined,
          tagId: filterTagId || undefined,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      window.electron.updateNote(
        id,
        note,
        buildSearchParams({
          name: name || undefined,
          date: filterDate || undefined,
          tagId: filterTagId || undefined,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  const updateItemTagsMutation = useMutation({
    mutationFn: ({ id, tagIds }: { id: number; tagIds: number[] }) =>
      window.electron.updateItemTags(
        id,
        tagIds,
        buildSearchParams({
          name: name || undefined,
          date: filterDate || undefined,
          tagId: filterTagId || undefined,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  const deleteTagMutation = useMutation({
    mutationFn: ({ tagId }: { tagId: number }) => {
      const search = buildSearchParams({
        name: name || undefined,
        date: filterDate || undefined,
        tagId: filterTagId || undefined,
      });
      const updatedSearch = updateSearchTagParam(search, tagId);
      return window.electron.deleteTag(tagId, updatedSearch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  // --- Derived data (replaces store items/tags) ---

  const items = itemsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(""), 3000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  const addItem = async () => {
    if (!name) return;
    try {
      await addItemMutation.mutateAsync({
        name,
        tagIds: filterTagId ? [filterTagId] : undefined,
      });
      setName("");
      toast.success("Item created", { description: "Item created successfully" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Unique constraint")) {
        setErrorMsg("A record with this name already exists.");
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {errorMsg && (
        <div className="mx-auto w-full max-w-5xl px-6 mt-2">
          <div className="bg-destructive/10 text-destructive text-xs px-3 py-2 rounded-md border border-destructive/20">
            {errorMsg}
          </div>
        </div>
      )}
      <div className={`${CONTAINER} overflow-y-auto min-h-0 pb-4`}>
        <div className="flex items-center justify-between gap-2 my-4">
          <div className="flex items-center gap-2">
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={filterDate ? "default" : "outline"}
                  size="icon"
                  className="shrink-0 cursor-pointer"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-3" align="start">
                <DayPicker
                  mode="single"
                  selected={filterDate || undefined}
                  onSelect={(d) => {
                    setDatePickerOpen(false);
                    if (d) setFilterDate(d);
                  }}
                  defaultMonth={filterDate || undefined}
                  classNames={{
                    day_button:
                      "p-2 h-9 w-9 rounded-md text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground",
                  }}
                />
                <style>{`
                  .rdp-button_next, .rdp-button_previous {
                    color: hsl(var(--muted-foreground)) !important;
                  }
                  .rdp-button_next:hover, .rdp-button_previous:hover {
                    background-color: hsl(var(--muted)) !important;
                  }
                `}</style>
                {filterDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterDate(null)}
                    className="w-full h-7 text-xs mt-1 cursor-pointer"
                  >
                    Clear Date
                  </Button>
                )}
              </PopoverContent>
            </Popover>
            {filterDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterDate(null)}
                className="shrink-0 text-xs cursor-pointer"
              >
                Clear Date
              </Button>
            )}
            <TagSelector
              selectedTagIds={filterTagId ? [filterTagId] : []}
              onTagIdsChange={(tagIds) => {
                setFilterTagId(tagIds[0] || null);
              }}
              variant="filter"
              trigger={
                <Button
                  variant={filterTagId ? "default" : "outline"}
                  size="icon"
                  className="shrink-0 cursor-pointer"
                >
                  <TagIcon className="h-4 w-4" />
                </Button>
              }
              deleteTagMutation={deleteTagMutation}
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Input
              className="w-full"
              placeholder="Search or enter new record"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
              }}
            />
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 cursor-pointer"
              size="icon"
              onClick={addItem}
              disabled={!name}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ListTable
          items={items}
          tags={tags}
          updateNoteMutation={updateNoteMutation}
          removeItemMutation={removeItemMutation}
          updateItemTagsMutation={updateItemTagsMutation}
          deleteTagMutation={deleteTagMutation}
        />
      </div>
      <div
        className={`border-t bg-background ${CONTAINER}`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "calc(100% - 60px)",
          borderBottom: "none",
        }}
      >
        <Pagination items={items} />
      </div>
    </div>
  );
}
