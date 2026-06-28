import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import type { EnvConfig } from "../config/env";
import type { DatasetMetadata } from "../types/domain";
import { loadAgentContext } from "./workbook";

interface StoredDataset extends DatasetMetadata {
  sourcePath: string;
}

const uploadRoot = resolve(import.meta.dir, "../../../data/uploads");
const registryPath = resolve(uploadRoot, "datasets.json");
const allowedExtensions = new Set([".xlsx", ".xls", ".csv"]);
const maxUploadBytes = 20 * 1024 * 1024;

function safeName(value: string) {
  return value
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

async function ensureUploadRoot() {
  await mkdir(uploadRoot, { recursive: true });
}

async function readRegistry(): Promise<StoredDataset[]> {
  await ensureUploadRoot();

  try {
    return JSON.parse(await readFile(registryPath, "utf8")) as StoredDataset[];
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }
}

async function writeRegistry(datasets: StoredDataset[]) {
  await ensureUploadRoot();
  await writeFile(registryPath, JSON.stringify(datasets, null, 2));
}

function toPublicMetadata(dataset: StoredDataset): DatasetMetadata {
  const { sourcePath: _sourcePath, ...metadata } = dataset;

  return metadata;
}

export function defaultDatasetMetadata(config: EnvConfig): DatasetMetadata {
  const context = loadAgentContext(config.datasetPath);

  return {
    id: "default",
    name: "Default MAFY workbook",
    filename: context.summary.dataset,
    uploadedAt: "bundled",
    rows: context.summary.rows,
    columns: context.summary.columns,
    participants: context.summary.participants,
    referrals: context.summary.referrals,
    status: "ready",
    isDefault: true,
  };
}

export async function listDatasets(config: EnvConfig): Promise<DatasetMetadata[]> {
  const registry = await readRegistry();

  return [
    defaultDatasetMetadata(config),
    ...registry.map(toPublicMetadata).sort((first, second) => {
      return second.uploadedAt.localeCompare(first.uploadedAt);
    }),
  ];
}

export async function resolveDatasetPath(
  config: EnvConfig,
  datasetId: string | undefined,
) {
  if (!datasetId || datasetId === "default") return config.datasetPath;

  const dataset = (await readRegistry()).find((item) => item.id === datasetId);

  if (!dataset) {
    throw new Error(`Dataset ${datasetId} was not found.`);
  }

  if (dataset.status !== "ready") {
    throw new Error(`Dataset ${dataset.name} is not ready for agent use.`);
  }

  return dataset.sourcePath;
}

export async function loadContextForDataset(
  config: EnvConfig,
  datasetId: string | undefined,
) {
  return loadAgentContext(await resolveDatasetPath(config, datasetId));
}

export async function saveUploadedDataset(
  file: File,
): Promise<DatasetMetadata> {
  const originalFilename = safeName(file.name || "uploaded-dataset.xlsx");
  const extension = extname(originalFilename).toLowerCase();

  if (!allowedExtensions.has(extension)) {
    throw new Error("Dataset upload must be an XLSX, XLS, or CSV file.");
  }

  if (file.size <= 0) {
    throw new Error("Dataset upload is empty.");
  }

  if (file.size > maxUploadBytes) {
    throw new Error("Dataset upload must be 20 MB or smaller.");
  }

  const id = `dataset-${randomUUID()}`;
  const datasetDir = resolve(uploadRoot, id);
  const sourcePath = resolve(datasetDir, `source${extension}`);

  await mkdir(datasetDir, { recursive: true });
  await writeFile(sourcePath, Buffer.from(await file.arrayBuffer()));

  try {
    const context = loadAgentContext(sourcePath);
    const dataset: StoredDataset = {
      id,
      name: originalFilename.replace(/\.[^.]+$/, "") || "Uploaded dataset",
      filename: basename(originalFilename),
      uploadedAt: new Date().toISOString(),
      rows: context.summary.rows,
      columns: context.summary.columns,
      participants: context.summary.participants,
      referrals: context.summary.referrals,
      status: "ready",
      sourcePath,
    };
    const registry = await readRegistry();

    await writeRegistry([dataset, ...registry]);

    return toPublicMetadata(dataset);
  } catch (error) {
    const dataset: StoredDataset = {
      id,
      name: originalFilename.replace(/\.[^.]+$/, "") || "Uploaded dataset",
      filename: basename(originalFilename),
      uploadedAt: new Date().toISOString(),
      rows: 0,
      columns: 0,
      participants: 0,
      referrals: 0,
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "Dataset could not be processed.",
      sourcePath,
    };
    const registry = await readRegistry();

    await writeRegistry([dataset, ...registry]);

    return toPublicMetadata(dataset);
  }
}

export async function deleteUploadedDataset(
  datasetId: string,
): Promise<DatasetMetadata> {
  if (!datasetId || datasetId === "default") {
    throw new Error("The bundled default dataset cannot be deleted.");
  }

  const registry = await readRegistry();
  const dataset = registry.find((item) => item.id === datasetId);

  if (!dataset) {
    throw new Error(`Dataset ${datasetId} was not found.`);
  }

  await writeRegistry(registry.filter((item) => item.id !== datasetId));

  const datasetDir = resolve(dirname(dataset.sourcePath));

  const relativeDatasetDir = relative(uploadRoot, datasetDir);

  if (
    relativeDatasetDir.length > 0 &&
    !relativeDatasetDir.startsWith("..") &&
    !relativeDatasetDir.startsWith("/")
  ) {
    await rm(datasetDir, { recursive: true, force: true });
  }

  return toPublicMetadata(dataset);
}
