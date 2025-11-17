import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  file: File | null;
  onRemove: () => void;
}

export const ImagePreview = ({ file, onRemove }: ImagePreviewProps) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview("");
    }
  }, [file]);

  if (!preview) return null;

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <img
        src={preview}
        alt="Preview"
        className="w-full h-64 object-cover rounded-lg shadow-card"
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={onRemove}
        className="absolute top-2 right-2 h-8 w-8 rounded-full"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
