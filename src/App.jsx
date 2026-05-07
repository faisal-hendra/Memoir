import "./App.css";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import { useEntries } from "./stores/entries";
import { useEffect } from "react";
import { ENTRIES } from "./mock-data";
import { useSelectedEntry } from "./stores/selected-entry";
import { createEmptyEntry } from "./modules/create-empty-entry";
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  const setEntries = useEntries((state) => state.setEntries);
  const setSelectedEntry = useSelectedEntry((state) => state.setSelectedEntry);

  useEffect(() => {
    setEntries(ENTRIES);
    ENTRIES.length > 0 ? selectFirstEntry() : createAndSelectNewEntry();
  }, []);

  function createAndSelectNewEntry() {
    const newEntry = createEmptyEntry();
    setEntries([newEntry]);
    setSelectedEntry(newEntry);
  }

  function selectFirstEntry() {
    setSelectedEntry(ENTRIES[0]);
  }

  return (
    <ThemeProvider>
      <main className="flex w-screen h-screen overflow-hidden">
        <Sidebar />
        <Editor />
      </main>
    </ThemeProvider>
  );
}

export default App;
