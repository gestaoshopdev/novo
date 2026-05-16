import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  aspect?: number; // 1 for 1:1 (profile), undefined for free (logo)
  onCropComplete: (croppedBase64: string) => void;
  title?: string;
  description?: string;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropModal({
  open,
  onOpenChange,
  imageSrc,
  aspect,
  onCropComplete,
  title = "Enquadrar Imagem",
  description = "Ajuste a imagem para o tamanho ideal."
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const handleSave = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const pixelRatio = window.devicePixelRatio;
      
      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;

      ctx.save();
      
      ctx.translate(-cropX, -cropY);
      
      ctx.drawImage(
        imgRef.current,
        0,
        0,
        imgRef.current.naturalWidth,
        imgRef.current.naturalHeight,
        0,
        0,
        imgRef.current.naturalWidth,
        imgRef.current.naturalHeight,
      );

      ctx.restore();

      const base64Image = canvas.toDataURL('image/jpeg');
      onCropComplete(base64Image);
      onOpenChange(false);
    } else {
      // Fallback
      if (imgRef.current) {
         onCropComplete(imageSrc);
         onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setCrop(undefined);
        setCompletedCrop(undefined);
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center bg-black/5 dark:bg-white/5 p-4 rounded-xl min-h-[300px] max-h-[60vh] overflow-hidden">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={aspect === 1}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                onLoad={onImageLoad}
                className="max-h-[50vh] w-auto object-contain"
                crossOrigin="anonymous" // Avoid CORS issues on canvas
              />
            </ReactCrop>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Recorte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
