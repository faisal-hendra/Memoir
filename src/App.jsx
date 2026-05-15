import "./App.css";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import { useEntries } from "./stores/entries";
import { useState, useEffect, useRef } from "react";
import { useSelectedEntry } from "./stores/selected-entry";
import { createEmptyEntry } from "./modules/create-empty-entry";
import { ThemeProvider } from "./components/ThemeProvider";
import Database from "@tauri-apps/plugin-sql";

function App() {
  const setEntries = useEntries((state) => state.setEntries);
  const setSelectedEntry = useSelectedEntry((state) => state.setSelectedEntry);
  const [error, setError] = useState("");
  const isInitializing = useRef(false);

  async function loadEntries() {
    if (isInitializing.current) return;
    isInitializing.current = true;

    try {
      const db = await Database.load("sqlite:memoir.db");
      const loadedEntries = await db.select(
        "SELECT * FROM entries ORDER BY id DESC",
      );

      setError("");
      setEntries(loadedEntries);

      if (loadedEntries.length > 0) {
        setSelectedEntry(loadedEntries[0]);
      } else {
        await createAndSelectNewEntry();
      }
    } catch (error) {
      console.error("Failed to get entries:", error);
      setError("Failed to get entries - check console");
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function createAndSelectNewEntry() {
    const db = await Database.load("sqlite:memoir.db");
    const newEntry = createEmptyEntry();
    const query = `INSERT INTO entries (id, date, title, content)
                   VALUES ($1, $2, $3, $4)`;
    try {
      setError("");
      await db.execute(query, [
        newEntry.id,
        newEntry.date,
        newEntry.title,
        newEntry.content,
      ]);
    } catch (error) {
      console.error("ERROR CREATING NEW ROW", error);
      throw error;
    } finally {
      setEntries((prev) => [newEntry, ...prev]);
      setSelectedEntry(newEntry);
    }
  }

  return (
    <ThemeProvider>
      <main className="flex w-screen h-screen overflow-hidden">
        <Sidebar createAndSelectNewEntry={createAndSelectNewEntry} />
        <Editor />
      </main>
    </ThemeProvider>
  );
}

export default App;
