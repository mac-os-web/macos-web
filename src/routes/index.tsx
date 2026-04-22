import { createFileRoute, redirect } from "@tanstack/react-router";
import { readAuthState } from "../contexts/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (readAuthState().status !== "authenticated") {
      throw redirect({ to: "/login" });
    }
  },
});
