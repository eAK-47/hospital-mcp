import { FiCpu, FiDatabase, FiRadio, FiServer, FiTool, FiZap } from "react-icons/fi";
import ConnectionStatus from "../components/ConnectionStatus";
import PageHeader from "../components/PageHeader";
import { mockApi } from "../services/mockApi";
import type { ConnectionName } from "../types";

const iconMap: Partial<Record<ConnectionName, typeof FiServer>> = {
  Simulator: FiRadio,
  Backend: FiServer,
  "Realtime Database": FiDatabase,
  "MCP Server": FiCpu,
  "AI Engine": FiZap,
  "Prompt Engine": FiTool,
  "Tool Registry": FiTool
};

export default function SystemStatus() {
  const statuses = mockApi.getConnections();

  return (
    <section>
      <PageHeader
        title="System Status"
        description="Live health panel for simulator, backend, realtime database, MCP, and AI tooling."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {statuses.map((status) => {
          const Icon = iconMap[status.name] ?? FiServer;
          return (
            <section key={status.name} className="panel p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-hospital-border bg-hospital-bg/50 text-hospital-blue">
                <Icon className="h-6 w-6" />
              </div>
              <ConnectionStatus status={status} />
              <p className="mt-4 text-sm leading-6 text-hospital-muted">
                Service is connected and reporting healthy status.
              </p>
            </section>
          );
        })}
      </div>
    </section>
  );
}
