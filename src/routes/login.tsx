import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return <Landing />;
}
