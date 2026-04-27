import clsx from "clsx";
import { Camera, ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type PreviewFile = {
  file: File;
  url: string;
  id: string;
};

type Props = {
  maxFiles?: number;
  maxSizeMb?: number;
  onChange: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
};

const ALLOWED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export const MultiImageUploader = ({
  maxFiles = 10,
  maxSizeMb = 8,
  onChange,
  disabled,
  className
}: Props) => {
  const [items, setItems] = useState<PreviewFile[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.url)), [items]);

  useEffect(() => {
    onChange(items.map((i) => i.file));
  }, [items, onChange]);

  const sizeLimitBytes = useMemo(() => maxSizeMb * 1024 * 1024, [maxSizeMb]);

  const addFiles = (picked: FileList | null) => {
    if (!picked) return;
    setError("");
    const nextItems: PreviewFile[] = [...items];
    const rejected: string[] = [];
    Array.from(picked).forEach((file) => {
      if (nextItems.length >= maxFiles) {
        rejected.push(`${file.name}: too many files`);
        return;
      }
      if (!ALLOWED_MIMES.has(file.type)) {
        rejected.push(`${file.name}: only JPG, PNG or WebP`);
        return;
      }
      if (file.size > sizeLimitBytes) {
        rejected.push(`${file.name}: exceeds ${maxSizeMb} MB`);
        return;
      }
      nextItems.push({
        file,
        url: URL.createObjectURL(file),
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`
      });
    });
    if (rejected.length) {
      setError(rejected.join("  ·  "));
    }
    setItems(nextItems);
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  return (
    <div className={clsx("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <figure
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-surface-border bg-white"
          >
            <img
              src={item.url}
              alt={item.file.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
            <button
              type="button"
              aria-label={`Remove ${item.file.name}`}
              onClick={() => remove(item.id)}
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-content/80 text-white backdrop-blur-sm transition hover:bg-action hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-content/85 to-transparent px-2 py-1.5 text-[10.5px] text-white">
              <span className="block truncate">{item.file.name}</span>
            </figcaption>
          </figure>
        ))}

        {items.length < maxFiles && !disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-border bg-surface-soft text-content-subtle transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Add photos</span>
          </button>
        )}
      </div>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-content-subtle">
          {items.length}/{maxFiles} photos attached · JPG, PNG or WebP · up to {maxSizeMb} MB each
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={disabled || items.length >= maxFiles}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-[12.5px] text-content-muted transition hover:border-brand-300 disabled:opacity-50 sm:hidden"
          >
            <Camera className="h-3.5 w-3.5" /> Take photo
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{error}</p>
      )}
    </div>
  );
};
