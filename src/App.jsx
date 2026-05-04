import "./App.css";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import { useEntries } from "./stores/entries";
import { useEffect } from "react";
import { ENTRIES } from "./mock-data";

function App() {
  const setEntries = useEntries((state) => state.setEntries);

  useEffect(() => {
    setEntries(ENTRIES);
  });

  return (
    <main className="flex w-screen h-screen overflow-hidden">
      <Sidebar />
      <Editor />
    </main>
  );
}

export default App;
