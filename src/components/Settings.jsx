import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { ThemeSwitch } from "./ui/theme-switch";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function Settings({ children }) {
  const { theme, setTheme } = useTheme();

  return (
    <Dialog className="w-min-400">
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>Settings</DialogHeader>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <CardDescription>
              Change the appearance of the application between{" "}
              <span className={theme === "light" && "font-semibold"}>
                Light{" "}
              </span>
              or{" "}
              <span className={theme === "dark" && "font-semibold"}>Dark</span>.
            </CardDescription>
            <div>
              <ThemeSwitch
                onCheckedChange={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
                checked={theme === "light"}
              ></ThemeSwitch>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
