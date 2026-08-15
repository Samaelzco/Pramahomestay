"use client";

import { ImageIcon, TrashIcon } from "@/components/ui/icons";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type RoomImageInputProps = {
  currentImageUrl?: string | null;
  errors?: string[];
};

export function RoomImageInput({ currentImageUrl, errors }: RoomImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [removeCurrent, setRemoveCurrent] = useState(false);
  const previewUrl = selectedImageUrl ?? (removeCurrent ? null : currentImageUrl);

  useEffect(() => {
    return () => {
      if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    };
  }, [selectedImageUrl]);

  function selectImage(file?: File) {
    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);

    if (!file) {
      setSelectedImageUrl(null);
      setFileName(null);
      return;
    }

    setSelectedImageUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setRemoveCurrent(false);
  }

  function clearImage() {
    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    if (inputRef.current) inputRef.current.value = "";
    setSelectedImageUrl(null);
    setFileName(null);
    setRemoveCurrent(Boolean(currentImageUrl));
  }

  return (
    <div className="sm:col-span-2">
      <span className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Foto kamar</span>
      <input name="remove_image" type="hidden" value={removeCurrent ? "1" : "0"} />
      <div className="mt-2 grid overflow-hidden rounded-lg bg-surface-low md:grid-cols-[minmax(0,1fr)_260px]">
        <div className="flex min-h-52 flex-col items-start justify-center p-6 md:min-h-64 md:p-8">
          <div className="grid size-10 place-items-center rounded-sm bg-surface text-secondary">
            <ImageIcon className="size-5" />
          </div>
          <p className="mt-5 text-base font-semibold text-primary">Pilih gambar utama kamar</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">Gunakan JPG, PNG, atau WebP hingga 5 MB. Foto horizontal akan tampil paling baik pada kartu kamar.</p>
          <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-sm border bg-surface px-5 text-sm font-semibold transition-colors hover:bg-surface-high focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
            <span>{previewUrl ? "Ganti gambar" : "Pilih gambar"}</span>
            <input
              ref={inputRef}
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-describedby="room-image-help"
              onChange={(event) => selectImage(event.target.files?.[0])}
            />
          </label>
          <p id="room-image-help" className="mt-3 text-xs text-muted">{fileName ?? (currentImageUrl && !removeCurrent ? "Gambar yang tersimpan saat ini" : "Belum ada gambar dipilih")}</p>
          {errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{error}</p>)}
        </div>
        <div className="relative min-h-52 bg-surface-high md:min-h-64">
          {previewUrl ? (
            <>
              <Image src={previewUrl} alt="Preview foto kamar" fill sizes="260px" unoptimized={previewUrl.startsWith("blob:")} className="object-cover" />
              <button type="button" onClick={clearImage} className="absolute top-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-sm bg-primary/90 px-3 text-xs font-semibold text-white transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <TrashIcon className="size-4" /> Hapus
              </button>
            </>
          ) : (
            <div className="grid h-full min-h-52 place-items-center px-6 text-center text-sm leading-6 text-muted md:min-h-64">Preview gambar akan muncul di sini.</div>
          )}
        </div>
      </div>
    </div>
  );
}
