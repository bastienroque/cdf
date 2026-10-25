import Image from "next/image";

interface RestaurantGalleryProps {
  photos: string[] | null;
  name: string;
}

export function RestaurantGallery({ photos, name }: RestaurantGalleryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="mb-8 -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-pl-4 px-4 scrollbar-width:none [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
      {photos.map((url, i) => (
        <div
          key={url}
          className={`relative h-64 shrink-0 snap-start overflow-hidden rounded-sm border border-amber-500/20 bg-card sm:w-auto ${
            photos.length === 1 ? "w-full" : "w-[85%]"
          }`}
        >
          <Image
            src={url}
            alt={`${name} photo ${i + 1}`}
            fill
            className="object-cover transition-transform duration-300"
            sizes="(max-width: 640px) 85vw, 50vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}
