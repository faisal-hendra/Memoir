import { useSelectedEntry } from "@/stores/selected-entry";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { CheckIcon, ChevronLeft, PencilIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useEntries } from "@/stores/entries";
import dayjs from "dayjs";

export default function Editor() {
  const entries = useEntries((state) => state.entries);
  const selectedEntry = useSelectedEntry((state) => state.selectedEntry);
  const setEntries = useEntries((state) => state.setEntries);

  const [activeEntry, setActiveEntry] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    setActiveEntry(selectedEntry);
  }, [selectedEntry]);

  useEffect(() => {
    console.log("Active Entry", activeEntry);
  }, [activeEntry]);

  useEffect(() => {
    isEditMode && textareaRef.current.focus();
  }, [isEditMode]);

  function onSave() {
    setEntries(
      entries.map((e) =>
        e.id === activeEntry.id
          ? { ...e, title: activeEntry.title, content: activeEntry.content }
          : e,
      ),
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 py-2 px-4">
      <div className="py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button size="icon">
            <ChevronLeft />
          </Button>
          <p className="text-muted-foreground">
            {dayjs(activeEntry?.date).format("dddd, DD MMMM YYYY")}
          </p>
        </div>
        <Button
          size="icon"
          onClick={() => {
            setIsEditMode((val) => !val);
            isEditMode && onSave();
          }}
        >
          {isEditMode ? <CheckIcon /> : <PencilIcon />}
        </Button>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <input
          type="text"
          className="text-2xl font-semibold outline-none bg-transparent"
          value={activeEntry?.title}
          onChange={(e) => {
            setActiveEntry((a) => ({ ...a, title: e.target.value }));
          }}
          disabled={!isEditMode}
        />
        <Separator className="my-2" />
        <textarea
          ref={textareaRef}
          type="text"
          className="w-full flex-1 min-h-0 resize-none outline-none bg-transparent"
          value={activeEntry?.content}
          onChange={(e) =>
            setActiveEntry((a) => ({ ...a, content: e.target.value }))
          }
          disabled={!isEditMode}
        ></textarea>
      </div>
    </div>
  );
}
