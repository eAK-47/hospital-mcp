export default function Loader() {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-hospital-muted">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-status-observation" />
      Waiting for backend connection...
    </div>
  );
}
