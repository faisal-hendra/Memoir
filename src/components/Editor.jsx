import { useSelectedEntry } from "@/stores/selected-entry";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { CheckIcon, ChevronLeft, PencilIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useEntries } from "@/stores/entries";
import dayjs from "dayjs";
import Database from "@tauri-apps/plugin-sql";

export default function Editor() {
  const selectedEntry = useSelectedEntry((state) => state.selectedEntry);
  const setEntries = useEntries((state) => state.setEntries);

  const [editableEntry, setEditableEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const textareaRef = useRef(null);

  async function updateDatabase() {
    try {
      const db = await Database.load("sqlite:memoir.db");
      const query = `UPDATE entries
                     SET title = $1,
                         content = $2
                     WHERE id = $3`;
      await db.execute(query, [
        editableEntry.title,
        editableEntry.content,
        editableEntry.id,
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      console.log("updateDatabase() has been executed");
    }
  }

  function saveEntry() {
    setEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === editableEntry.id) {
          return {
            ...entry,
            title: editableEntry.title,
            content: editableEntry.content,
          };
        } else {
          return entry;
        }
      }),
    );
    updateDatabase();
    console.log("Test");
  }

  useEffect(() => {
    setEditableEntry(selectedEntry);
    setIsEditing(false);
  }, [selectedEntry]);

  useEffect(() => {
    console.log("Active Entry", editableEntry);
  }, [editableEntry]);

  useEffect(() => {
    isEditing && textareaRef.current.focus();
  }, [isEditing]);

  return (
    <div className="flex-1 flex flex-col min-h-0 py-2 px-4">
      <div className="py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {dayjs(editableEntry?.date).format("dddd, DD MMMM YYYY")}
          </p>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            setIsEditing((prev) => !prev);
            isEditing && saveEntry();
          }}
        >
          {isEditing ? <CheckIcon /> : <PencilIcon />}
        </Button>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <input
          type="text"
          className="text-2xl font-semibold outline-none bg-transparent"
          value={editableEntry?.title}
          onChange={(e) => {
            setEditableEntry((prevEntry) => ({
              ...prevEntry,
              title: e.target.value,
            }));
          }}
          disabled={!isEditing}
        />
        <Separator className="my-2" />
        <textarea
          ref={textareaRef}
          type="text"
          className="w-full flex-1 min-h-0 resize-none outline-none bg-transparent"
          value={editableEntry?.content}
          onChange={(e) =>
            setEditableEntry((prevEntry) => ({
              ...prevEntry,
              content: e.target.value,
            }))
          }
          disabled={!isEditing}
        ></textarea>
      </div>
    </div>
  );
}
