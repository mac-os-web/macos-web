import { createFileRoute, redirect } from "@tanstack/react-router";
import { readAuthState } from "../contexts/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (readAuthState().status === "authenticated") {
      throw redirect({ to: "/" });
    }
  },
});
