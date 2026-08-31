"use client";

import { ImageIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import type { RoomGalleryImage } from "@/lib/api/types";
import { shouldBypassImageOptimization } from "@/lib/image";
import { localize, localizeApiMessage, useLocale } from "@/lib/locale";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type SelectedImage = { file: File; url: string };
type RoomImageInputProps = { currentImages?: RoomGalleryImage[]; errors?: string[] };

export function RoomImageInput({ currentImages = [], errors }: RoomImageInputProps) {
  const locale = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Set<string>());
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const activeCurrentImages = currentImages.filter((image) => !removedImageIds.includes(image.id));
  const totalImages = activeCurrentImages.length + selectedImages.length;
  const coverId = activeCurrentImages[0]?.id;

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function syncFileInput(images: SelectedImage[]) {
    if (!inputRef.current || typeof DataTransfer === "undefined") return;
    const transfer = new DataTransfer();
    images.forEach(({ file }) => transfer.items.add(file));
    inputRef.current.files = transfer.files;
  }

  function selectImages(files: FileList | null) {
    if (!files?.length) return;

    const candidates = Array.from(files);
    const invalidType = candidates.find((file) => !ACCEPTED_TYPES.has(file.type));
    if (invalidType) {
      setClientError(localize(locale, `${invalidType.name} bukan JPG, PNG, atau WebP.`, `${invalidType.name} is not a JPG, PNG, or WebP image.`));
      syncFileInput(selectedImages);
      return;
    }
    const oversized = candidates.find((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setClientError(localize(locale, `${oversized.name} melebihi batas 5 MB.`, `${oversized.name} exceeds the 5 MB limit.`));
      syncFileInput(selectedImages);
      return;
    }

    const remainingSlots = MAX_IMAGES - totalImages;
    if (candidates.length > remainingSlots) {
      setClientError(localize(locale, `Hanya ${remainingSlots} foto lagi yang dapat ditambahkan. Maksimal 10 foto per kamar.`, `Only ${remainingSlots} more photos can be added. Each room supports up to 10 photos.`));
      syncFileInput(selectedImages);
      return;
    }

    const existingKeys = new Set(selectedImages.map(({ file }) => `${file.name}:${file.size}:${file.lastModified}`));
    const additions = candidates.filter((file) => !existingKeys.has(`${file.name}:${file.size}:${file.lastModified}`)).map((file) => {
      const url = URL.createObjectURL(file);
      previewUrls.current.add(url);
      return { file, url };
    });
    const nextImages = [...selectedImages, ...additions];
    setSelectedImages(nextImages);
    syncFileInput(nextImages);
    setClientError(additions.length === candidates.length ? null : localize(locale, "Foto yang sama tidak ditambahkan dua kali.", "Duplicate photos were not added."));
  }

  function removeSelectedImage(index: number) {
    const removed = selectedImages[index];
    URL.revokeObjectURL(removed.url);
    previewUrls.current.delete(removed.url);
    const nextImages = selectedImages.filter((_, imageIndex) => imageIndex !== index);
    setSelectedImages(nextImages);
    syncFileInput(nextImages);
    setClientError(null);
  }

  function toggleStoredImage(id: number) {
    setRemovedImageIds((current) => {
      if (current.includes(id) && totalImages >= MAX_IMAGES) {
        setClientError(localize(locale, "Hapus foto lain terlebih dahulu sebelum membatalkan penghapusan ini.", "Remove another photo before restoring this one."));
        return current;
      }
      setClientError(null);
      return current.includes(id) ? current.filter((imageId) => imageId !== id) : [...current, id];
    });
  }

  return <div className="sm:col-span-2">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">{localize(locale, "Galeri kamar", "Room gallery")}</p><p id="room-images-help" className="mt-2 text-sm leading-6 text-muted">{localize(locale, "Unggah JPG, PNG, atau WebP maksimal 5 MB per foto. Foto pertama menjadi cover.", "Upload JPG, PNG, or WebP files up to 5 MB each. The first photo becomes the cover.")}</p></div><p className="text-sm font-semibold tabular-nums">{totalImages} / {MAX_IMAGES} {localize(locale, "foto", totalImages === 1 ? "photo" : "photos")}</p></div>
    {removedImageIds.map((id) => <input key={id} type="hidden" name="remove_image_ids[]" value={id} />)}
    <div className="mt-4 rounded-lg bg-surface-low p-4 sm:p-5">
      <label className={`flex min-h-24 items-center gap-4 rounded-sm border border-dashed bg-surface px-4 py-4 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${totalImages >= MAX_IMAGES ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-surface-high"}`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-sm bg-primary text-white">{totalImages ? <PlusIcon className="size-5" /> : <ImageIcon className="size-5" />}</span>
        <span className="min-w-0"><span className="block text-sm font-semibold">{totalImages ? localize(locale, "Tambah foto lain", "Add more photos") : localize(locale, "Pilih beberapa foto", "Choose multiple photos")}</span><span className="mt-1 block text-xs leading-5 text-muted">{localize(locale, "Pilih sekaligus atau tambahkan dalam beberapa kali pilihan.", "Select them together or add them in several batches.")}</span></span>
        <input ref={inputRef} name="images[]" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={totalImages >= MAX_IMAGES} className="sr-only" aria-describedby="room-images-help" onChange={(event) => selectImages(event.target.files)} />
      </label>

      {(currentImages.length > 0 || selectedImages.length > 0) ? <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {currentImages.map((image) => {
          const removed = removedImageIds.includes(image.id);
          return <figure key={image.id} className={`relative min-w-0 overflow-hidden rounded-lg bg-surface-high ${removed ? "opacity-55" : ""}`}>
            <div className="relative aspect-[4/3]"><Image src={image.url} alt={localize(locale, "Foto kamar tersimpan", "Saved room photo")} fill sizes="(max-width: 640px) 50vw, 240px" unoptimized={shouldBypassImageOptimization(image.url)} className="object-cover" /></div>
            <figcaption className="flex min-h-12 items-center justify-between gap-2 px-3 py-2 text-xs"><span className="truncate font-semibold">{removed ? localize(locale, "Akan dihapus", "Will be deleted") : image.id === coverId ? "Cover" : localize(locale, "Tersimpan", "Saved")}</span><button type="button" onClick={() => toggleStoredImage(image.id)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 font-semibold text-secondary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{removed ? localize(locale, "Batalkan", "Undo") : <><TrashIcon className="size-3.5" />{localize(locale, "Hapus", "Delete")}</>}</button></figcaption>
          </figure>;
        })}
        {selectedImages.map((image, index) => <figure key={image.url} className="relative min-w-0 overflow-hidden rounded-lg bg-surface-high">
          <div className="relative aspect-[4/3]"><Image src={image.url} alt={`Preview ${image.file.name}`} fill sizes="(max-width: 640px) 50vw, 240px" unoptimized className="object-cover" /></div>
          <figcaption className="flex min-h-12 items-center justify-between gap-2 px-3 py-2 text-xs"><span className="truncate font-semibold" title={image.file.name}>{activeCurrentImages.length === 0 && index === 0 ? localize(locale, "Cover baru", "New cover") : image.file.name}</span><button type="button" onClick={() => removeSelectedImage(index)} aria-label={localize(locale, `Hapus ${image.file.name} dari pilihan`, `Remove ${image.file.name} from selection`)} className="grid size-9 shrink-0 place-items-center text-secondary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><TrashIcon className="size-4" /></button></figcaption>
        </figure>)}
      </div> : <div className="mt-4 grid min-h-28 place-items-center rounded-sm bg-surface px-5 text-center text-sm leading-6 text-muted">{localize(locale, "Belum ada foto kamar. Pilih hingga 10 foto untuk membuat galeri.", "No room photos yet. Select up to 10 photos to create a gallery.")}</div>}
    </div>
    {clientError && <p role="alert" className="mt-2 text-sm text-danger">{clientError}</p>}
    {errors?.map((error) => <p key={error} className="mt-2 text-sm text-danger">{localizeApiMessage(locale, error)}</p>)}
  </div>;
}
