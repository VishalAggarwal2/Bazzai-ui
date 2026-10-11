import { ManagerShell } from "@/components/shell/manager-shell";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <ManagerShell>{children}</ManagerShell>;
}
