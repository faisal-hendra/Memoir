import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useSelectedEntry } from "@/stores/selected-entry";
import { useEntries } from "@/stores/entries";
import dayjs from "dayjs";

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 300;

export default function Sidebar() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const entries = useEntries((state) => state.entries);
  const setEntries = useEntries((state) => state.setEntries);
  const selectedEntry = useSelectedEntry((state) => state.selectedEntry);
  const setSelectedEntry = useSelectedEntry((state) => state.setSelectedEntry);

  useEffect(() => {
    console.log("Selected Entry", selectedEntry);
  }, [selectedEntry]);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!sidebarRef.current) return;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  function handleNewEntry(entriesAfterDeletion) {
    const newId = Date.now();
    const newDate = dayjs().format("YYYY-MM-DD");
    const newEntry = {
      id: newId,
      date: newDate,
      title: "New Entry",
      content: "",
    };

    const TODAYS_DATE = dayjs().format("YYYY-MM-DD");

    const vacantEntry =
      entries.filter(
        (e) =>
          e.title === "New Entry" && e.content === "" && e.date === TODAYS_DATE,
      ) ||
      entriesAfterDeletion?.filter(
        (e) =>
          e.title === "New Entry" && e.content === "" && e.date === TODAYS_DATE,
      );

    console.log("Is Vacant Available", vacantEntry);

    if (vacantEntry.length > 0) {
      setSelectedEntry(vacantEntry[0]);
    } else {
      if (entriesAfterDeletion) {
        setEntries([newEntry, ...entriesAfterDeletion]);
      } else {
        setEntries([newEntry, ...entries]);
      }
      setSelectedEntry(newEntry);
    }
  }

  function handleDelete(idToDelete) {
    const entriesAfterDeletion = entries.filter((e) => e.id !== idToDelete);
    setEntries(entriesAfterDeletion);

    if (idToDelete === selectedEntry.id || entriesAfterDeletion.length < 0) {
      handleNewEntry(entriesAfterDeletion);
    }
  }

  return (
    <div
      ref={sidebarRef}
      style={{ width }}
      className={`relative h-screen p-2 bg-sidebar border-r border-sidebar-border flex flex-col ${isResizing ? "select-none cursor-col-resize" : ""}`}
    >
      <div className={`flex items-center font-bold`}></div>
      <div className="flex flex-col mt-2 overflow-y-auto">
        <div className="flex justify-center">
          <Button
            type="button"
            className="mb-2 hover:cursor-pointer flex items-center gap-1 px-4"
            onClick={() => {
              handleNewEntry();
            }}
          >
            <PlusIcon className="w-4 h-4" />
            New
          </Button>
        </div>

        {entries?.map((e) => (
          <button
            type="button"
            className={`${e.id === selectedEntry?.id ? "bg-sidebar-accent" : "bg-card"} mb-1 p-2 hover:cursor-pointer flex items-center justify-between text-left rounded-md transition-colors group`}
            key={e.id}
            onClick={() => {
              setSelectedEntry(e);
            }}
          >
            <span className="truncate flex-1 mr-2">{e.title}</span>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 w-5 h-5 shrink-0 transition-opacity"
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(e.id);
              }}
            >
              <TrashIcon className="w-3 h-3 text-destructive" />
            </Button>
          </button>
        ))}
      </div>
      <button
        type="button"
        onMouseDown={startResizing}
        aria-label="Resize sidebar"
        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors"
      />
    </div>
  );
}
