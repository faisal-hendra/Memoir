import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { PlusIcon, SearchIcon, TrashIcon, X } from "lucide-react";
import { useSelectedEntry } from "@/stores/selected-entry";
import { useEntries } from "@/stores/entries";
import dayjs from "dayjs";
import { Input } from "./ui/input";

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
  const [filteredEntries, setFilteredEntries] = useState([]);

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    setFilteredEntries(entries);
    searchKeyword && handleSearch();
  }, [entries]);

  function handleSearch() {
    const regex = new RegExp(searchKeyword, "i");

    if (searchKeyword.length > 0) {
      setFilteredEntries(
        entries.filter((e) => regex.test(e.title) || regex.test(e.content)),
      );
    } else {
      setFilteredEntries(entries);
    }
  }

  useEffect(() => {
    handleSearch();
  }, [searchKeyword]);

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
    const currentEntries = entriesAfterDeletion ?? entries;

    const newId = Date.now();
    const newDate = dayjs().format("YYYY-MM-DD");
    const newEntry = {
      id: newId,
      date: newDate,
      title: "New Entry",
      content: "",
    };

    const existingVacant = currentEntries.find(
      (e) => e.title === "New Entry" && e.content === "" && e.date === newDate,
    );

    if (existingVacant) {
      setEntries(currentEntries);
      setSelectedEntry(existingVacant);
    } else {
      setEntries([newEntry, ...currentEntries]);
      setSelectedEntry(newEntry);
    }
  }

  function handleDelete(idToDelete) {
    const entriesAfterDeletion = entries.filter((e) => e.id !== idToDelete);

    if (idToDelete === selectedEntry?.id || entriesAfterDeletion.length === 0) {
      handleNewEntry(entriesAfterDeletion);
    } else {
      setEntries(entriesAfterDeletion);
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
        {!isSearchMode ? (
          <div className="flex justify-center gap-2">
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
            <Button
              className="mb-2 hover:cursor-pointer flex items-center gap-1 px-4"
              onClick={() => {
                setIsSearchMode((val) => !val);
              }}
            >
              <SearchIcon />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            <Input
              onChange={(e) => setSearchKeyword(e.target.value)}
              value={searchKeyword}
              className="outline-0"
              placeholder="Search"
            />
            <Button
              variant="ghost"
              className="mb-2 hover:cursor-pointer flex items-center gap-1 px-4"
              onClick={() => {
                setIsSearchMode((val) => !val);
                setSearchKeyword("");
              }}
            >
              <X />
            </Button>
          </div>
        )}

        {filteredEntries?.map((e) => (
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
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary/10 active:bg-primary/30 transition-colors"
      />
    </div>
  );
}
