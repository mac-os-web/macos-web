import { createLazyFileRoute } from "@tanstack/react-router";
import { LockScreen } from "../pages/LockScreen";

export const Route = createLazyFileRoute("/login")({
  component: LockScreen,
});
