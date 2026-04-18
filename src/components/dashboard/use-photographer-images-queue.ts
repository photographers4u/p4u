"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createImageUploadRequest,
  getImageUploadErrorMessage,
  validateImageUploadFile,
} from "@/components/forms/use-image-upload";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import {
  photographerPortfolioUploadAutoRetryLimit,
  photographerPortfolioUploadConcurrency,
} from "@/lib/photographer-upload-config";
import type { PhotographerOnboardingUploadInput } from "@/zod/schema/photographer";
import type { PhotographerUpload } from "@/zod/schema/photographer-upload";

type QueueItemSource = "existing" | "new";
export type PortfolioUploadQueueState =
  | "idle"
  | "uploading"
  | "success"
  | "failed"
  | "cancelled";

export type PortfolioUploadQueueItem = {
  clientId: string;
  errorMessage: string | null;
  file: File | null;
  hasExactProgress: boolean;
  persistedOrder: number | null;
  persistedUploadId: string | null;
  previewUrl: string;
  progress: number;
  remoteUrl: string | null;
  retryCount: number;
  source: QueueItemSource;
  state: PortfolioUploadQueueState;
};

class PortfolioUploadQueueError extends Error {
  remoteUrl: string | null;
  retryable: boolean;

  constructor(message: string, options?: { remoteUrl?: string | null; retryable?: boolean }) {
    super(message);
    this.name = "PortfolioUploadQueueError";
    this.remoteUrl = options?.remoteUrl ?? null;
    this.retryable = options?.retryable ?? false;
  }
}

function createExistingQueueItem(
  upload: PhotographerOnboardingUploadInput,
): PortfolioUploadQueueItem {
  return {
    clientId: `persisted-${upload.id}`,
    errorMessage: null,
    file: null,
    hasExactProgress: true,
    persistedOrder: upload.displayOrder,
    persistedUploadId: upload.id,
    previewUrl: upload.imageUrl,
    progress: 100,
    remoteUrl: upload.imageUrl,
    retryCount: 0,
    source: "existing",
    state: "success",
  };
}

function createQueuedFileItem(file: File): PortfolioUploadQueueItem {
  return {
    clientId: crypto.randomUUID(),
    errorMessage: null,
    file,
    hasExactProgress: false,
    persistedOrder: null,
    persistedUploadId: null,
    previewUrl: URL.createObjectURL(file),
    progress: 0,
    remoteUrl: null,
    retryCount: 0,
    source: "new",
    state: "idle",
  };
}

function updateQueueItem(
  items: PortfolioUploadQueueItem[],
  clientId: string,
  updater: (item: PortfolioUploadQueueItem) => PortfolioUploadQueueItem,
) {
  return items.map((item) =>
    item.clientId === clientId ? updater(item) : item,
  );
}

function releasePreviewUrl(previewUrl: string) {
  if (previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
}

function getRetriableMessage(error: Error) {
  const message = error.message.toLowerCase();

  return (
    message.includes("network issue") ||
    message.includes("timed out") ||
    message.includes("temporarily") ||
    message.includes("try again")
  );
}

function normalizeQueueError(error: unknown, remoteUrl: string | null) {
  if (error instanceof PortfolioUploadQueueError) {
    return error;
  }

  if (error instanceof Error && error.message === "Upload canceled.") {
    return new PortfolioUploadQueueError("Upload canceled.", {
      remoteUrl,
      retryable: false,
    });
  }

  if (error instanceof Error) {
    return new PortfolioUploadQueueError(getImageUploadErrorMessage(error), {
      remoteUrl,
      retryable: getRetriableMessage(error),
    });
  }

  return new PortfolioUploadQueueError(
    "Couldn't upload the image right now.",
    {
      remoteUrl,
      retryable: false,
    },
  );
}

export function usePhotographerImagesQueue({
  initialUploads,
}: {
  initialUploads: PhotographerOnboardingUploadInput[];
}) {
  const [isDropActive, setIsDropActive] = useState(false);
  const [items, setItems] = useState<PortfolioUploadQueueItem[]>(() =>
    [...initialUploads]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map(createExistingQueueItem),
  );
  const [removingClientIds, setRemovingClientIds] = useState<string[]>([]);
  const [scheduledUploadClientIds, setScheduledUploadClientIds] = useState<
    string[]
  >([]);
  const itemsRef = useRef(items);
  const isMountedRef = useRef(false);
  const uploadCancellationHandlersRef = useRef(
    new Map<string, () => void>(),
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      for (const cancelUpload of uploadCancellationHandlersRef.current.values()) {
        cancelUpload();
      }

      for (const item of itemsRef.current) {
        releasePreviewUrl(item.previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  function scheduleUploads(clientIds: string[]) {
    if (clientIds.length === 0) {
      return;
    }

    setScheduledUploadClientIds((current) => {
      const nextIds = new Set(current);

      for (const clientId of clientIds) {
        nextIds.add(clientId);
      }

      return Array.from(nextIds);
    });
  }

  function unscheduleUpload(clientId: string) {
    setScheduledUploadClientIds((current) =>
      current.filter((id) => id !== clientId),
    );
  }

  const startUpload = useEffectEvent(async (clientId: string) => {
    const currentItem = itemsRef.current.find((item) => item.clientId === clientId);

    if (!currentItem || currentItem.state !== "idle") {
      return;
    }

    setItems((current) =>
      updateQueueItem(current, clientId, (item) => ({
        ...item,
        errorMessage: null,
        hasExactProgress: Boolean(item.remoteUrl),
        progress: item.remoteUrl ? 100 : 0,
        state: "uploading",
      })),
    );

    try {
      if (!currentItem.file) {
        throw new PortfolioUploadQueueError(
          "Choose an image before uploading.",
        );
      }

      const uploadRequest = createImageUploadRequest<PhotographerUpload>({
        file: currentItem.file,
        onProgress: (progress) => {
          if (!isMountedRef.current) {
            return;
          }

          setItems((current) =>
            updateQueueItem(current, clientId, (item) => ({
              ...item,
              hasExactProgress: true,
              progress,
            })),
          );
        },
        requestPath: "/api/uploads/photographer-portfolio",
      });

      uploadCancellationHandlersRef.current.set(clientId, uploadRequest.cancel);

      const payload = await uploadRequest.promise;
      uploadCancellationHandlersRef.current.delete(clientId);

      if (!payload?.id || !payload.imageUrl) {
        throw new PortfolioUploadQueueError(
          "Upload finished, but we couldn't save the image.",
          {
            retryable: false,
          },
        );
      }

      if (!isMountedRef.current) {
        return;
      }

      const latestItem = itemsRef.current.find((item) => item.clientId === clientId);
      if (latestItem) {
        releasePreviewUrl(latestItem.previewUrl);
      }

      setItems((current) =>
        updateQueueItem(current, clientId, (item) => ({
          ...item,
          errorMessage: null,
          file: null,
          hasExactProgress: true,
          persistedOrder: payload.displayOrder,
          persistedUploadId: payload.id,
          previewUrl: payload.imageUrl,
          progress: 100,
          remoteUrl: payload.imageUrl,
          state: "success",
        })),
      );
      unscheduleUpload(clientId);
    } catch (error) {
      uploadCancellationHandlersRef.current.delete(clientId);

      if (!isMountedRef.current) {
        return;
      }

      const queueError = normalizeQueueError(error, null);

      if (
        queueError.message !== "Upload canceled." &&
        queueError.retryable &&
        currentItem.retryCount < photographerPortfolioUploadAutoRetryLimit
      ) {
        setItems((current) =>
          updateQueueItem(current, clientId, (item) => ({
            ...item,
            errorMessage: null,
            hasExactProgress: Boolean(queueError.remoteUrl),
            progress: queueError.remoteUrl ? 100 : 0,
            remoteUrl: queueError.remoteUrl,
            retryCount: item.retryCount + 1,
            state: "idle",
          })),
        );
        return;
      }

      setItems((current) =>
        updateQueueItem(current, clientId, (item) => ({
          ...item,
          errorMessage: queueError.message,
          hasExactProgress: Boolean(queueError.remoteUrl),
          progress:
            queueError.message === "Upload canceled."
              ? 0
              : queueError.remoteUrl
                ? 100
                : item.progress,
          remoteUrl: queueError.remoteUrl,
          state:
            queueError.message === "Upload canceled."
              ? "cancelled"
              : "failed",
        })),
      );
      unscheduleUpload(clientId);
    }
  });

  useEffect(() => {
    const activeUploadCount = items.filter((item) => item.state === "uploading").length;
    const availableSlots =
      photographerPortfolioUploadConcurrency - activeUploadCount;

    if (availableSlots <= 0) {
      return;
    }

    const queuedItems = items
      .filter(
        (item) =>
          item.source === "new" &&
          item.state === "idle" &&
          scheduledUploadClientIds.includes(item.clientId),
      )
      .slice(0, availableSlots);

    for (const item of queuedItems) {
      void startUpload(item.clientId);
    }
  }, [items, scheduledUploadClientIds, startUpload]);

  function addFiles(nextFiles: FileList | File[]) {
    const files = Array.from(nextFiles);

    if (files.length === 0) {
      return;
    }

    const acceptedItems: PortfolioUploadQueueItem[] = [];

    for (const file of files) {
      const validationError = validateImageUploadFile(file);

      if (validationError) {
        toast.error(`${file.name}: ${validationError}`);
        continue;
      }

      acceptedItems.push(createQueuedFileItem(file));
    }

    if (acceptedItems.length === 0) {
      return;
    }

    setItems((current) => [...current, ...acceptedItems]);
  }

  function cancelItem(clientId: string) {
    const cancelUpload = uploadCancellationHandlersRef.current.get(clientId);

    if (cancelUpload) {
      cancelUpload();
    }
  }

  async function removeItem(clientId: string) {
    const currentItem = itemsRef.current.find((item) => item.clientId === clientId);

    if (!currentItem) {
      return;
    }

    if (currentItem.persistedUploadId) {
      setRemovingClientIds((current) => [...current, clientId]);

      try {
        const response = await apiClient.photographer.uploads[":id"].$delete({
          param: {
            id: currentItem.persistedUploadId,
          },
        });
        const { errorMessage } = await readApiResponse(response);

        if (!response.ok) {
          toast.error(errorMessage ?? "Couldn't remove the portfolio image.");
          return;
        }

        releasePreviewUrl(currentItem.previewUrl);
        unscheduleUpload(clientId);
        setItems((current) =>
          current.filter((item) => item.clientId !== clientId),
        );
      } catch {
        toast.error("Couldn't remove the portfolio image.");
      } finally {
        setRemovingClientIds((current) =>
          current.filter((id) => id !== clientId),
        );
      }

      return;
    }

    releasePreviewUrl(currentItem.previewUrl);
    unscheduleUpload(clientId);
    setItems((current) => current.filter((item) => item.clientId !== clientId));
  }

  function retryItem(clientId: string) {
    scheduleUploads([clientId]);
    setItems((current) =>
      updateQueueItem(current, clientId, (item) => ({
        ...item,
        errorMessage: null,
        hasExactProgress: Boolean(item.remoteUrl),
        progress: item.remoteUrl ? 100 : 0,
        retryCount: 0,
        state: "idle",
      })),
    );
  }

  function startUploads() {
    const idleClientIds = itemsRef.current
      .filter((item) => item.source === "new" && item.state === "idle")
      .map((item) => item.clientId);

    scheduleUploads(idleClientIds);
  }

  const newUploadItems = items.filter((item) => item.source === "new");
  const stagedUploadCount = newUploadItems.filter(
    (item) =>
      item.state === "idle" &&
      !scheduledUploadClientIds.includes(item.clientId),
  ).length;
  const activeUploadCount = newUploadItems.filter(
    (item) => item.state === "uploading",
  ).length;
  const cancelledUploadCount = newUploadItems.filter(
    (item) => item.state === "cancelled",
  ).length;
  const completedUploadCount = newUploadItems.filter(
    (item) => item.state === "success",
  ).length;
  const failedUploadCount = newUploadItems.filter(
    (item) => item.state === "failed",
  ).length;
  const queuedUploadCount = newUploadItems.filter(
    (item) =>
      item.state === "idle" &&
      scheduledUploadClientIds.includes(item.clientId),
  ).length;
  const savedImageCount = items.filter((item) => item.persistedUploadId).length;
  const overallProgress =
    newUploadItems.length === 0
      ? 0
      : Math.round(
          newUploadItems.reduce((sum, item) => {
            if (
              item.state === "success" ||
              item.state === "failed" ||
              item.state === "cancelled"
            ) {
              return sum + 100;
            }

            if (item.state === "uploading") {
              return sum + (item.hasExactProgress ? item.progress : 35);
            }

            return sum;
          }, 0) / newUploadItems.length,
        );
  const statusMessage =
    activeUploadCount > 0
      ? `Uploading ${Math.min(
          newUploadItems.length,
          completedUploadCount + activeUploadCount,
        )} of ${newUploadItems.length}`
      : stagedUploadCount > 0
        ? `${stagedUploadCount} image${
            stagedUploadCount === 1 ? "" : "s"
          } ready to upload`
      : queuedUploadCount > 0
        ? `${queuedUploadCount} image${
            queuedUploadCount === 1 ? "" : "s"
          } waiting in the queue`
        : failedUploadCount > 0
          ? `${failedUploadCount} image${
              failedUploadCount === 1 ? "" : "s"
            } need attention`
          : cancelledUploadCount > 0
            ? `${cancelledUploadCount} image${
                cancelledUploadCount === 1 ? "" : "s"
              } cancelled`
          : newUploadItems.length > 0
            ? `All ${completedUploadCount} new image${
                completedUploadCount === 1 ? "" : "s"
              } are ready.`
            : `${savedImageCount} portfolio image${
                savedImageCount === 1 ? "" : "s"
              } saved.`;

  return {
    activeUploadCount,
    addFiles,
    cancelItem,
    cancelledUploadCount,
    completedUploadCount,
    failedUploadCount,
    isDropActive,
    items,
    overallProgress,
    queuedUploadCount,
    removeItem,
    removingClientIds,
    retryItem,
    savedImageCount,
    scheduledUploadClientIds,
    setIsDropActive,
    stagedUploadCount,
    startUploads,
    statusMessage,
  };
}
