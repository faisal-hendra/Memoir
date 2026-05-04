import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useSelectedEntry } from "@/stores/selected-entry";
import { useEntries } from "@/stores/entries";
import dayjs from "dayjs";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const entries = useEntries((state) => state.entries);
  const setEntries = useEntries((state) => state.setEntries);
  const selectedEntry = useSelectedEntry((state) => state.selectedEntry);
  const setSelectedEntry = useSelectedEntry((state) => state.setSelectedEntry);

  useEffect(() => {
    console.log("Selected Entry", selectedEntry);
  }, [selectedEntry]);

  function handleNewEntry(entriesAfterDeletion) {
    const newId = Date.now();
    const newDate = dayjs().format("DD-MM-YYYY");
    const newEntry = {
      id: newId,
      date: newDate,
      title: "New Entry",
      content: "",
    };

    if (entriesAfterDeletion) {
      setEntries([newEntry, ...entriesAfterDeletion]);
    } else {
      setEntries([newEntry, ...entries]);
    }

    setSelectedEntry(newEntry);
  }

  function handleDelete(idToDelete) {
    const entriesAfterDelete = entries.filter((e) => e.id !== idToDelete);
    setEntries(entriesAfterDelete);

    if (idToDelete === selectedEntry.id || entriesAfterDelete.length < 0) {
      handleNewEntry(entriesAfterDelete);
    }
  }

  return (
    <div
      className={`min-w-25 ${isOpen ? "w-75" : "max-w-20"} h-screen p-2 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200`}
    >
      <div
        className={`flex ${isOpen ? "justify-end" : "justify-center"} items-center font-bold`}
      ></div>
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
    </div>
  );
}
