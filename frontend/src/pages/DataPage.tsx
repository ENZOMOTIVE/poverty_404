import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  FileSpreadsheet,
  Loader2,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import StatusPill from "../components/ui/StatusPill";
import { useAnalytics } from "../providers/analyticsContext";
import type { DatasetMetadata } from "../types/analytics";
import { cn, formatNumber } from "../utils/format";

type UploadStatus = "idle" | "uploading" | "ready" | "error";

function formatUploadedAt(dataset: DatasetMetadata) {
  if (dataset.uploadedAt === "bundled") return "Bundled workbook";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dataset.uploadedAt));
}

export default function DataPage() {
  const {
    backendStatus,
    datasetId,
    datasets,
    deleteDataset,
    refreshDatasets,
    setDatasetId,
    summary,
    uploadDataset,
  } = useAnalytics();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [deletingDatasetId, setDeletingDatasetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeDataset = useMemo(() => {
    return datasets.find((dataset) => dataset.id === datasetId);
  }, [datasetId, datasets]);
  const sortedDatasets = useMemo(() => {
    return datasets.slice().sort((first, second) => {
      if (first.isDefault) return -1;
      if (second.isDefault) return 1;

      return second.uploadedAt.localeCompare(first.uploadedAt);
    });
  }, [datasets]);

  async function handleUpload() {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setError(null);

    try {
      const dataset = await uploadDataset(selectedFile);

      if (dataset.status === "error") {
        setUploadStatus("error");
        setError(dataset.error ?? "Dataset could not be processed.");
        return;
      }

      setUploadStatus("ready");
      setSelectedFile(null);
    } catch (caught) {
      setUploadStatus("error");
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    }
  }

  async function handleRefresh() {
    setError(null);

    try {
      await refreshDatasets();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Dataset registry could not be refreshed.",
      );
    }
  }

  async function handleDelete(dataset: DatasetMetadata) {
    if (dataset.isDefault) return;

    const confirmed = window.confirm(
      `Delete ${dataset.name}? This removes the uploaded file from local storage.`,
    );

    if (!confirmed) return;

    setDeletingDatasetId(dataset.id);
    setError(null);

    try {
      await deleteDataset(dataset.id);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Dataset could not be deleted.",
      );
    } finally {
      setDeletingDatasetId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="MAFY data feed"
        title="Dataset input and active feed"
        description="Upload raw workbook or CSV data, validate it through the MAFY pipeline, and choose which dataset powers the workspace and agents."
      >
        <div className="flex items-center gap-2 rounded-md border border-grid bg-panel px-3 py-2">
          <DatabaseZap className="size-4 text-neon" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase text-white">
            {backendStatus === "live" ? "Dataset service live" : "Service required"}
          </span>
        </div>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-12">
        <Panel
          title="Active dataset"
          subtitle="Every dashboard, action queue, forecast, and report uses this feed."
          className="xl:col-span-5"
          action={<StatusPill status={backendStatus === "live" ? "Live" : "Stable"} />}
        >
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-md border border-neon/35 bg-neon/10 text-neon">
              <FileSpreadsheet className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">
                {activeDataset?.name ?? summary.dataset}
              </p>
              <p className="mt-1 text-sm text-muted">
                {activeDataset?.filename ?? summary.dataset}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Rows", formatNumber(summary.rows)],
              ["Participants", formatNumber(summary.participants)],
              ["Referrals", formatNumber(summary.referrals)],
              ["Columns", formatNumber(summary.columns)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-grid bg-ink-2 p-3"
              >
                <p className="text-xs uppercase text-muted">{label}</p>
                <p className="mt-1 font-mono text-lg text-white">{value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Upload dataset"
          subtitle="Accepted files are XLSX, XLS, and CSV exports with MAFY-compatible columns."
          className="xl:col-span-7"
        >
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <label className="flex min-h-28 cursor-pointer flex-col justify-center rounded-md border border-dashed border-grid bg-ink-2 px-4 py-4 transition hover:border-neon/45">
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md border border-neon/35 bg-neon/10 text-neon">
                  <Upload className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">
                    {selectedFile?.name ?? "Choose dataset file"}
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    {selectedFile
                      ? `${formatNumber(selectedFile.size)} bytes selected`
                      : "XLSX, XLS, or CSV"}
                  </span>
                </span>
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(event) => {
                  setError(null);
                  setUploadStatus("idle");
                  setSelectedFile(event.target.files?.[0] ?? null);
                }}
              />
            </label>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                disabled={
                  !selectedFile ||
                  uploadStatus === "uploading" ||
                  backendStatus !== "live"
                }
                onClick={handleUpload}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-neon/50 bg-neon px-4 text-sm font-semibold text-ink transition hover:bg-neon/85 disabled:cursor-not-allowed disabled:border-grid disabled:bg-grid disabled:text-muted"
              >
                {uploadStatus === "uploading" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-4" aria-hidden="true" />
                )}
                Upload feed
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-grid bg-panel px-4 text-sm font-semibold text-ash transition hover:border-neon/40 hover:text-neon"
              >
                <RefreshCcw className="size-4" aria-hidden="true" />
                Refresh
              </button>
            </div>
          </div>

          {uploadStatus === "ready" && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-neon/35 bg-neon/10 px-3 py-2 text-sm text-neon">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Dataset processed and activated.
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger">
              <AlertTriangle className="size-4" aria-hidden="true" />
              {error}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Dataset registry"
        subtitle="Ready datasets can be activated for agent workflows."
      >
        <div className="grid gap-3">
          {sortedDatasets.map((dataset) => {
            const isActive = dataset.id === datasetId;
            const isReady = dataset.status === "ready";

            return (
              <article
                key={dataset.id}
                className={cn(
                  "grid gap-4 rounded-md border bg-ink-2 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
                  isActive
                    ? "border-neon/45"
                    : dataset.status === "error"
                      ? "border-danger/35"
                      : "border-grid",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {dataset.name}
                    </p>
                    <StatusPill
                      status={
                        dataset.status === "ready"
                          ? isActive
                            ? "Live"
                            : "Stable"
                          : "High"
                      }
                    />
                    {dataset.isDefault && (
                      <span className="rounded border border-grid bg-panel px-2 py-1 text-[11px] font-semibold uppercase text-muted">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">
                    {dataset.filename} · {formatUploadedAt(dataset)}
                  </p>
                  {dataset.error && (
                    <p className="mt-2 text-xs text-danger">{dataset.error}</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-[repeat(4,92px)_auto_auto] sm:items-center">
                  {[
                    ["Rows", dataset.rows],
                    ["Cols", dataset.columns],
                    ["People", dataset.participants],
                    ["Refs", dataset.referrals],
                  ].map(([label, value]) => (
                    <div key={label} className="text-xs">
                      <p className="text-muted">{label}</p>
                      <p className="mt-1 font-mono text-white">
                        {formatNumber(Number(value))}
                      </p>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={!isReady || isActive}
                    onClick={() => setDatasetId(dataset.id)}
                    className="inline-flex h-10 items-center justify-center rounded-md border border-grid bg-panel px-3 text-xs font-semibold uppercase text-ash transition hover:border-neon/40 hover:text-neon disabled:cursor-not-allowed disabled:text-muted"
                  >
                    {isActive ? "Active" : "Activate"}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(dataset.isDefault) || deletingDatasetId === dataset.id}
                    onClick={() => handleDelete(dataset)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-danger/35 bg-danger/10 px-3 text-xs font-semibold uppercase text-danger transition hover:bg-danger/15 disabled:cursor-not-allowed disabled:border-grid disabled:bg-panel disabled:text-muted"
                  >
                    {deletingDatasetId === dataset.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="size-4" aria-hidden="true" />
                    )}
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
