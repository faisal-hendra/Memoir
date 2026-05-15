import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { PlusIcon, SearchIcon, TrashIcon, X } from "lucide-react";
import { Settings as SettingsIcon } from "lucide-react";
import { useSelectedEntry } from "@/stores/selected-entry";
import { useEntries } from "@/stores/entries";
import { Input } from "./ui/input";
import Settings from "./Settings";
import Database from "@tauri-apps/plugin-sql";
import { useSidebarWidth } from "@/stores/sidebar-width";
import { SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH } from "@/const/sidebar";

export default function Sidebar({ createAndSelectNewEntry }) {
  const savedSidebarWidth = useSidebarWidth((state) => state.sidebarWidth);
  const setSavedSidebarWidth = useSidebarWidth(
    (state) => state.setSidebarWidth,
  );
  const [width, setWidth] = useState(savedSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const entries = useEntries((state) => state.entries);
  const setEntries = useEntries((state) => state.setEntries);
  const selectedEntry = useSelectedEntry((state) => state.selectedEntry);
  const setSelectedEntry = useSelectedEntry((state) => state.setSelectedEntry);
  const [filteredEntries, setFilteredEntries] = useState([]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  function findUntitledEntry() {
    return entries.find(
      (e) => e.title === "Untitled" && e.content.trim() === "",
    );
  }

  function handleNewEntry() {
    const emptyEntry = findUntitledEntry();
    if (emptyEntry) {
      setSelectedEntry(emptyEntry);
    } else {
      createAndSelectNewEntry();
    }
  }

  function handleSearch() {
    // Escape special regex characters in searchTerm to escape errors
    const regex = new RegExp(
      searchTerm.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
      "i",
    );
    if (searchTerm.length > 0) {
      setFilteredEntries(
        entries.filter(
          (entry) => regex.test(entry.title) || regex.test(entry.content),
        ),
      );
    } else {
      setFilteredEntries(entries);
    }
  }

  useEffect(() => {
    setFilteredEntries(entries);
    searchTerm && handleSearch();
  }, [entries]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      if (!sidebarRef.current) return;
      const newWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, e.clientX),
      );
      setWidth(newWidth);
      clearTimeout(window.sidebarResizeTimer);
      window.sidebarResizeTimer = setTimeout(() => {
        setSavedSidebarWidth(newWidth);
      }, 500);
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

  async function handleDeleteEntry(entryId) {
    const emptyEntry = findUntitledEntry();
    if (selectedEntry.id === emptyEntry?.id && entryId === emptyEntry?.id) {
      return null;
    }
    try {
      const db = await Database.load("sqlite:memoir.db");
      await db.execute("DELETE FROM entries WHERE id = ?", [entryId]);
    } catch (error) {
      console.error("ERROR DELETING AN ENTRY", error);
      throw error;
    } finally {
      setEntries((prevEntries) => {
        const remainingEntries = prevEntries.filter(
          (entry) => entry.id !== entryId,
        );
        if (entryId === selectedEntry?.id || remainingEntries.length === 0) {
          const nextEntry = findUntitledEntry();
          if (nextEntry) {
            setSelectedEntry(nextEntry);
          } else {
            createAndSelectNewEntry();
          }
        }
        return remainingEntries;
      });
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
        {!isSearchOpen ? (
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
              variant="outline"
              className="mb-2 hover:cursor-pointer flex items-center gap-1 px-4"
              onClick={() => {
                setIsSearchOpen((prev) => !prev);
              }}
            >
              <SearchIcon />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            <Input
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              className="outline-0"
              placeholder="Search"
            />
            <Button
              variant="ghost"
              className="mb-2 hover:cursor-pointer flex items-center gap-1 px-4"
              onClick={() => {
                setIsSearchOpen((prev) => !prev);
                setSearchTerm("");
              }}
            >
              <X />
            </Button>
          </div>
        )}

        {filteredEntries?.map((entry) => (
          <button
            type="button"
            className={`${entry.id === selectedEntry?.id ? "bg-sidebar-accent" : "bg-card"} mb-1 p-2 hover:cursor-pointer flex items-center justify-between text-left rounded-md transition-colors group`}
            key={entry.id}
            onClick={() => {
              setSelectedEntry(entry);
            }}
          >
            <span className="truncate flex-1 mr-2">{entry.title}</span>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 w-5 h-5 shrink-0 transition-opacity"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteEntry(entry.id);
              }}
            >
              <TrashIcon className="w-3 h-3 text-destructive" />
            </Button>
          </button>
        ))}
      </div>
      <div className="absolute bottom-2 left-2 opacity-10 hover:opacity-100 transition-all">
        <Settings>
          <Button variant="ghost">
            <SettingsIcon />
          </Button>
        </Settings>
      </div>
      <button
        type="button"
        onMouseDown={startResizing}
        aria-label="Resize sidebar"
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary/10 active:bg-primary/30 transition-colors"
      />
      {isSearchOpen && filteredEntries.length === 0 && (
        <div className="text-center pt-2 text-muted-foreground text-sm">
          <p>No result found</p>
        </div>
      )}
    </div>
  );
}
