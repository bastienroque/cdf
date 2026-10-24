import Image from "next/image";

interface RestaurantGalleryProps {
  photos: string[] | null;
  name: string;
}

export function RestaurantGallery({ photos, name }: RestaurantGalleryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {photos.map((url, i) => (
        <div
          key={url}
          className="relative h-64 overflow-hidden rounded-sm border border-amber-500/20 bg-card "
        >
          <Image
            src={url}
            alt={`${name} photo ${i + 1}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}
