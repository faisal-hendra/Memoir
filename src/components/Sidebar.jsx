import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { PlusIcon, SearchIcon, TrashIcon, X } from "lucide-react";
import { useSelectedEntry } from "@/stores/selected-entry";
import { useEntries } from "@/stores/entries";
import { Input } from "./ui/input";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "./ui/theme-switch";
import Database from "@tauri-apps/plugin-sql";

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const DEFAULT_WIDTH = 250;

export default function Sidebar({ createAndSelectNewEntry }) {
  const { theme, setTheme } = useTheme();

  const [width, setWidth] = useState(DEFAULT_WIDTH);
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

  // Finds an empty "Untitled" entry that can be reused
  function findVacant() {
    const availableEmptyEntry = entries.find(
      (e) => e.title === "Untitled" && e.content.trim() === "",
    );
    return availableEmptyEntry;
  }

  function handleNewEntry() {
    if (findVacant()) {
      setSelectedEntry(findVacant());
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

  async function handleDeleteEntry(entryId) {
    const vacantEntry = findVacant();
    // Prevents deleting if the entry being deleted is the vacant entry AND it's currently selected
    if (selectedEntry.id === vacantEntry?.id && entryId === vacantEntry?.id) {
      return null;
    } else {
      try {
        const db = await Database.load("sqlite:memoir.db");
        await db.execute("DELETE FROM entries WHERE id = ?", [entryId]);
      } catch (error) {
        console.error("ERROR DELETING AN ENTRY", error);
        throw error;
      } finally {
        setEntries((prevEntries) => {
          const entriesAfterDeletion = prevEntries.filter(
            (entry) => entry.id !== entryId,
          );
          console.log(entriesAfterDeletion);
          if (
            entryId === selectedEntry?.id ||
            entriesAfterDeletion.length === 0
          ) {
            findVacant()
              ? setSelectedEntry(findVacant())
              : createAndSelectNewEntry();
          }
          console.log("handleDeleteEntry() Executed!");
          return entriesAfterDeletion;
        });
      }
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
        <ThemeSwitch
          onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          checked={theme === "light"}
        ></ThemeSwitch>
      </div>
      <button
        type="button"
        onMouseDown={startResizing}
        aria-label="Resize sidebar"
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary/10 active:bg-primary/30 transition-colors"
      />
      {isSearchOpen && filteredEntries.length === 0 && (
        <div className="text-center pt-2 text-muted-foreground">
          <p>No result found</p>
        </div>
      )}
    </div>
  );
}
