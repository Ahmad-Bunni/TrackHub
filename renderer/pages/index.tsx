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
import { buildSearchParams } from "@/lib/utils";
import { useItemStore } from "@/state";
import type { Item, Tag } from "@prisma/client";
import { Calendar, Plus, Tag as TagIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { toast } from "sonner";

const CONTAINER = "mx-auto w-full max-w-5xl px-6";

export default function IndexPage() {
  const {
    name,
    setName,
    setCurrentItems,
    setTags,
    filterDate,
    setFilterDate,
    filterTagId,
    setFilterTagId,
    getAllTags,
  } = useItemStore();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const listenersRef = useRef<{
    handleMessage: (
      event: import("electron").IpcRendererEvent,
      args: Item[],
    ) => void;
    handleError: (
      event: import("electron").IpcRendererEvent,
      error: { message: string },
    ) => void;
    handleTags: (
      event: import("electron").IpcRendererEvent,
      tags: Tag[],
    ) => void;
  } | null>(null);

  useEffect(() => {
    // Use refs to avoid stale closures in event handlers
    const currentSetCurrentItems = setCurrentItems;
    const currentSetTags = setTags;
    const currentSetFilterTagId = setFilterTagId;

    const handleMessage = (_: unknown, args: Item[]) =>
      currentSetCurrentItems(args);
    const handleError = (_: unknown, error: { message: string }) => {
      console.error("IPC Error:", error.message);
      if (error.message.includes("Unique constraint")) {
        setTimeout(
          () => setErrorMsg("A record with this name already exists."),
          0,
        );
      }
    };
    const handleTags = (_: unknown, tags: Tag[]) => {
      currentSetTags(tags);
      const currentFilterTagId = useItemStore.getState().filterTagId;
      if (
        currentFilterTagId &&
        !tags.some((t) => t.id === currentFilterTagId)
      ) {
        currentSetFilterTagId(null);
      }
    };
    listenersRef.current = { handleMessage, handleError, handleTags };

    window.electron.startListening(handleMessage, "listed");
    window.electron.startListening(handleError, "error");
    window.electron.startListening(handleTags, "tagsListed");
    // ponytail: initial load via searchWithDate (no filter = all items), avoids race with listItems
    window.electron.searchWithDate({
      name: name || undefined,
      date: filterDate || undefined,
      tagId: filterTagId || undefined,
    });
    getAllTags();
    return () => {
      if (listenersRef.current) {
        window.electron.stopListening(
          listenersRef.current.handleMessage,
          "listed",
        );
        window.electron.stopListening(
          listenersRef.current.handleError,
          "error",
        );
        window.electron.stopListening(
          listenersRef.current.handleTags,
          "tagsListed",
        );
      }
    };
  }, []);

  useEffect(() => {
    clearTimeout(searchTimerRef.current!);
    searchTimerRef.current = setTimeout(() => {
      window.electron.searchWithDate({
        name: name || undefined,
        date: filterDate || undefined,
        tagId: filterTagId || undefined,
      });
    }, 150);
  }, [name, filterDate, filterTagId]);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(""), 3000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  const searchParams = buildSearchParams({
    name: undefined,
    date: filterDate,
    tagId: filterTagId,
  });

  const addItem = async () => {
    if (!name) return;
    const capturedName = name;
    try {
      const items = await window.electron.addItem({
        name: capturedName,
        tagIds: filterTagId ? [filterTagId] : undefined,
        search: searchParams,
      });
      setCurrentItems(items);
      setName("");
      toast("Item created", { description: "Item created successfully" });
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
                    onClick={() => {
                      setFilterDate(null);
                      window.electron.searchWithDate({
                        name: name || undefined,
                        tagId: filterTagId || undefined,
                      });
                    }}
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
                onClick={() => {
                  setFilterDate(null);
                  window.electron.searchWithDate({
                    name: name || undefined,
                    tagId: filterTagId || undefined,
                  });
                }}
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
              searchParams={{
                name: name || undefined,
                date: filterDate || undefined,
                tagId: filterTagId || undefined,
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
        <ListTable />
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
        <Pagination />
      </div>
    </div>
  );
}
