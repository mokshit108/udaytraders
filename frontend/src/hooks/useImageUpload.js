/**
 * useImageUpload
 * Shared product-image picker logic for the admin modals.
 *
 * Handles: type/size validation (with messages the user can actually see),
 * browser-side downscaling so phone photos fit the 5 MB API limit, real
 * upload progress against POST /upload/image, retry, and removal.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const UNSUPPORTED_TYPE_LABELS = {
  "image/heic": "HEIC",
  "image/heif": "HEIF",
  "image/avif": "AVIF",
  "image/tiff": "TIFF",
  "image/bmp": "BMP",
  "image/svg+xml": "SVG",
};

/** `accept` attribute for the file input. Unsupported formats stay listed so
 *  the user gets an explanation instead of an empty, silently blocked picker. */
export const ACCEPT_ATTR = [
  ...ACCEPTED_IMAGE_TYPES,
  "image/heic",
  "image/heif",
  "image/avif",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
  ".avif",
].join(",");

export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "5 MB";

const COMPRESS_ABOVE_BYTES = 800 * 1024;
const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.85;
const UPLOAD_TIMEOUT_MS = 90000;

export const formatBytes = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const createId = () =>
  `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const inferMimeType = (file) => {
  if (file.type) return file.type.toLowerCase();
  const extension = (file.name.split(".").pop() || "").toLowerCase();
  if (!extension) return "";
  return `image/${extension === "jpg" ? "jpeg" : extension}`;
};

const getSignature = (file) => `${file.name}|${file.size}|${file.lastModified}`;

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The browser could not read this image."));
    };
    image.src = objectUrl;
  });

/** Shrinks large photos so a 12 MP phone shot comfortably clears the 5 MB API limit. */
const downscaleIfLarge = async (file) => {
  if (file.type === "image/gif" || file.size <= COMPRESS_ABOVE_BYTES) return file;
  try {
    const image = await loadImageElement(file);
    const longestEdge = Math.max(image.width, image.height) || 1;
    const scale = Math.min(1, MAX_EDGE_PX / longestEdge);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "product-image";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
  } catch {
    // Unreadable by the browser (e.g. HEIC) — the size check below reports it.
    return file;
  }
};

const uploadFile = (file, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const apiUrl = import.meta.env.VITE_API_URL;

    xhr.open("POST", `${apiUrl}/upload/image`);
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const total = event.total || 1;
        onProgress(Math.min(95, Math.round((event.loaded / total) * 100)));
      }
    };

    xhr.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        payload = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && payload?.url) {
        resolve(payload.url);
        return;
      }
      reject(
        new Error(
          payload?.error ||
            `The upload server rejected the image (HTTP ${xhr.status}).`
        )
      );
    };

    xhr.onerror = () =>
      reject(
        new Error(
          "Could not reach the upload server. Check that the backend is running and VITE_API_URL is correct."
        )
      );

    xhr.ontimeout = () =>
      reject(new Error("The upload timed out. Please try again."));

    const formData = new FormData();
    formData.append("image", file);
    xhr.send(formData);
  });

export default function useImageUpload({ autoUpload = true } = {}) {
  const [items, setItems] = useState([]);
  const [rejections, setRejections] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const itemsRef = useRef([]);
  const filesRef = useRef(new Map());
  const inflightRef = useRef(new Map());
  const activeUploadsRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const patchItem = useCallback((id, patch) => {
    if (!mountedRef.current) return;
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }, []);

  const runUpload = useCallback(
    (id) => {
      const inFlight = inflightRef.current.get(id);
      if (inFlight) return inFlight;

      const promise = (async () => {
        const sourceFile = filesRef.current.get(id);
        if (!sourceFile) {
          return { id, url: null, error: "The selected file is no longer available." };
        }

        activeUploadsRef.current += 1;
        if (mountedRef.current) setIsUploading(true);
        patchItem(id, { status: "uploading", progress: 0, error: null });

        try {
          const prepared = await downscaleIfLarge(sourceFile);
          if (prepared.size > MAX_UPLOAD_BYTES) {
            throw new Error(
              `Still ${formatBytes(prepared.size)} after resizing. The limit is ${MAX_UPLOAD_LABEL}.`
            );
          }

          const url = await uploadFile(prepared, (progress) =>
            patchItem(id, { progress })
          );
          patchItem(id, {
            status: "done",
            progress: 100,
            url,
            uploadedBytes: prepared.size,
            error: null,
          });
          return { id, url, error: null };
        } catch (error) {
          const message = error?.message || "Upload failed.";
          patchItem(id, { status: "error", progress: 0, error: message });
          return { id, url: null, error: message };
        } finally {
          activeUploadsRef.current -= 1;
          if (activeUploadsRef.current <= 0 && mountedRef.current) {
            setIsUploading(false);
          }
        }
      })().finally(() => {
        inflightRef.current.delete(id);
      });

      inflightRef.current.set(id, promise);
      return promise;
    },
    [patchItem]
  );

  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      if (incoming.length === 0) return;

      const knownSignatures = new Set(itemsRef.current.map((item) => item.signature));
      const newItems = [];
      const newRejections = [];

      incoming.forEach((file) => {
        const type = inferMimeType(file);
        const signature = getSignature(file);

        if (!ACCEPTED_IMAGE_TYPES.includes(type)) {
          const label = UNSUPPORTED_TYPE_LABELS[type];
          newRejections.push({
            id: createId(),
            name: file.name,
            reason: label
              ? `${label} images can't be read by browsers. Export it as JPG or PNG and try again.`
              : "Only JPG, PNG, WEBP or GIF images can be uploaded.",
          });
          return;
        }

        if (file.size > MAX_SOURCE_BYTES) {
          newRejections.push({
            id: createId(),
            name: file.name,
            reason: `This file is ${formatBytes(file.size)}. Images up to ${formatBytes(
              MAX_SOURCE_BYTES
            )} are accepted.`,
          });
          return;
        }

        if (knownSignatures.has(signature)) {
          newRejections.push({
            id: createId(),
            name: file.name,
            reason: "This image has already been added.",
          });
          return;
        }

        knownSignatures.add(signature);
        const id = createId();
        filesRef.current.set(id, file);
        newItems.push({
          id,
          name: file.name,
          size: file.size,
          type,
          signature,
          previewUrl: URL.createObjectURL(file),
          status: "queued",
          progress: 0,
          url: null,
          error: null,
        });
      });

      if (newRejections.length > 0) {
        setRejections((previous) => [...previous, ...newRejections]);
      }

      if (newItems.length === 0) return;

      // Update the mirror eagerly so a submit in the same tick still sees these files
      const nextItems = [...itemsRef.current, ...newItems];
      itemsRef.current = nextItems;
      setItems(nextItems);

      if (autoUpload) {
        newItems.forEach((item) => runUpload(item.id));
      }
    },
    [autoUpload, runUpload]
  );

  const removeItem = useCallback((id) => {
    filesRef.current.delete(id);
    const target = itemsRef.current.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    const nextItems = itemsRef.current.filter((item) => item.id !== id);
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  const retryItem = useCallback((id) => runUpload(id), [runUpload]);

  const dismissRejections = useCallback(() => setRejections([]), []);

  const removeRejection = useCallback(
    (id) => setRejections((previous) => previous.filter((rejection) => rejection.id !== id)),
    []
  );

  /** Uploads everything that isn't uploaded yet and reports the outcome per file. */
  const uploadAll = useCallback(async () => {
    const snapshot = itemsRef.current;
    if (snapshot.length === 0) return { uploads: [], failures: [] };

    const settled = await Promise.all(
      snapshot.map(async (item) => {
        if (item.status === "done" && item.url) {
          return { id: item.id, previewUrl: item.previewUrl, name: item.name, url: item.url, error: null };
        }
        const result = await runUpload(item.id);
        return {
          id: item.id,
          previewUrl: item.previewUrl,
          name: item.name,
          url: result?.url ?? null,
          error: result?.error ?? "Upload failed.",
        };
      })
    );

    return {
      uploads: settled.filter((entry) => entry.url),
      failures: settled.filter((entry) => !entry.url),
    };
  }, [runUpload]);

  const clear = useCallback(() => {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    filesRef.current.clear();
    itemsRef.current = [];
    setItems([]);
    setRejections([]);
  }, []);

  const uploadedUrls = items.filter((item) => item.status === "done" && item.url).map((item) => item.url);
  const failedCount = items.filter((item) => item.status === "error").length;
  const pendingCount = items.filter(
    (item) => item.status === "queued" || item.status === "uploading"
  ).length;

  return {
    items,
    rejections,
    isUploading,
    uploadedUrls,
    failedCount,
    pendingCount,
    hasItems: items.length > 0,
    addFiles,
    removeItem,
    retryItem,
    uploadAll,
    clear,
    dismissRejections,
    removeRejection,
  };
}
