import dayjs from "dayjs";

export function createEmptyEntry() {
  const newId = Date.now();
  const newDate = dayjs().format("YYYY-MM-DD");
  const newEntry = {
    id: newId,
    date: newDate,
    title: "Untitled",
    content: "",
  };
  return newEntry;
}
