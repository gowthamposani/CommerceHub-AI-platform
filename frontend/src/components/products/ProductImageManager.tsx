import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState, type DragEvent } from "react";

import { getApiErrorMessage } from "@/api/errors";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/Progress";
import { PRODUCT_IMAGE_ACCEPTED_TYPES, PRODUCT_IMAGE_MAX_SIZE_BYTES } from "@/constants/productImage";
import { queryKeys } from "@/lib/queryKeys";
import { notify } from "@/services/notificationService";
import {
  deleteProductImage,
  getProductImages,
  markPrimaryProductImage,
  updateProductImage,
  uploadProductImage
} from "@/services/productImageService";
import type { ProductImage } from "@/types/productImage";

function validateImageFile(file: File) {
  if (!PRODUCT_IMAGE_ACCEPTED_TYPES.includes(file.type as (typeof PRODUCT_IMAGE_ACCEPTED_TYPES)[number])) {
    return "Only JPEG, PNG, and WEBP images are supported";
  }
  if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) {
    return "Image must be 10 MB or smaller";
  }
  return null;
}

export function ProductImageManager({ productId }: { productId: string }) {
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);

  const imagesQuery = useQuery({
    queryKey: queryKeys.products.images(productId),
    queryFn: () => getProductImages(productId)
  });

  const images = useMemo(() => imagesQuery.data?.data?.items ?? [], [imagesQuery.data?.data?.items]);

  const invalidateImages = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.products.images(productId) });
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProductImage(productId, { file }),
    onMutate: () => setUploadProgress(35),
    onSuccess: async () => {
      setUploadProgress(100);
      notify.success("Product image uploaded");
      await invalidateImages();
      window.setTimeout(() => setUploadProgress(0), 600);
    },
    onError: (error) => {
      setUploadProgress(0);
      notify.error(getApiErrorMessage(error));
    }
  });

  const replaceMutation = useMutation({
    mutationFn: ({ image, file }: { image: ProductImage; file: File }) => updateProductImage(image.id, { file }),
    onSuccess: async () => {
      notify.success("Product image replaced");
      await invalidateImages();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const reorderMutation = useMutation({
    mutationFn: ({ image, displayOrder }: { image: ProductImage; displayOrder: number }) =>
      updateProductImage(image.id, { displayOrder }),
    onSuccess: invalidateImages,
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const primaryMutation = useMutation({
    mutationFn: (image: ProductImage) => markPrimaryProductImage(image.id),
    onSuccess: async () => {
      notify.success("Primary image updated");
      await invalidateImages();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  const deleteMutation = useMutation({
    mutationFn: (image: ProductImage) => deleteProductImage(image.id),
    onSuccess: async () => {
      notify.success("Product image deleted");
      setImageToDelete(null);
      await invalidateImages();
    },
    onError: (error) => notify.error(getApiErrorMessage(error))
  });

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      notify.error(error);
      return;
    }
    uploadMutation.mutate(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  }

  function replaceImage(image: ProductImage, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      notify.error(error);
      return;
    }
    replaceMutation.mutate({ image, file });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-950">Product Media</h2>
            <p className="mt-1 text-sm text-gray-500">Upload, preview, reorder, replace, and mark primary images.</p>
          </div>
          {images.length ? <Badge tone="info">{images.length} images</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <label
          className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition ${
            dragActive ? "border-brand-gold bg-brand-gold/10" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <UploadCloud className="h-8 w-8 text-brand-gold" />
          <span className="mt-2 text-sm font-bold text-gray-950">Drop image here or click to upload</span>
          <span className="mt-1 text-xs text-gray-500">JPEG, PNG, WEBP up to 10 MB</span>
          <input
            className="sr-only"
            type="file"
            accept={PRODUCT_IMAGE_ACCEPTED_TYPES.join(",")}
            onChange={(event) => handleFiles(event.target.files)}
          />
        </label>

        {uploadProgress ? <Progress value={uploadProgress} /> : null}

        {imagesQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-56 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-500">
            <ImagePlus className="mr-2 h-5 w-5" />
            No product images uploaded
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-soft">
                <div className="relative flex aspect-[4/3] items-center justify-center bg-gray-50">
                  <img
                    src={image.image_url}
                    alt={image.alt_text ?? "Product image"}
                    className="h-full w-full object-contain"
                  />
                  {image.is_primary ? (
                    <span className="absolute left-3 top-3">
                      <Badge tone="success">Primary</Badge>
                    </span>
                  ) : null}
                </div>
                <div className="space-y-3 p-3">
                  <Input
                    defaultValue={image.alt_text ?? ""}
                    placeholder="Alt text"
                    aria-label="Image alt text"
                    onBlur={async (event) => {
                      await updateProductImage(image.id, { altText: event.target.value });
                      await invalidateImages();
                    }}
                  />
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Move image up"
                      disabled={index === 0}
                      onClick={() =>
                        reorderMutation.mutate({ image, displayOrder: Math.max(0, image.display_order - 1) })
                      }
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Move image down"
                      onClick={() => reorderMutation.mutate({ image, displayOrder: image.display_order + 1 })}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Mark primary image"
                      disabled={image.is_primary}
                      onClick={() => primaryMutation.mutate(image)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
                      Replace
                      <input
                        className="sr-only"
                        type="file"
                        accept={PRODUCT_IMAGE_ACCEPTED_TYPES.join(",")}
                        onChange={(event) => replaceImage(image, event.target.files)}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Delete image"
                      onClick={() => setImageToDelete(image)}
                    >
                      <Trash2 className="h-4 w-4 text-brand-red" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmationDialog
          open={Boolean(imageToDelete)}
          title="Delete image"
          message="Soft delete this product image? The gallery will update immediately."
          confirmLabel="Delete"
          onCancel={() => setImageToDelete(null)}
          onConfirm={() => imageToDelete && deleteMutation.mutate(imageToDelete)}
        />
      </CardContent>
    </Card>
  );
}
