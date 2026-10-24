import Image from "next/image";

const RestaurantPin = ({ restaurant }: { restaurant: any }) => {
  return (
    <div className=" flex flex-col gap-2 text-sm p-2 text-brand-dark">
      <h1 className="font-serif font-bold">{restaurant.restaurantName}</h1>
      <div className="flex h-fit flex-row gap-4 items-center justify-between font-sans">
        <div className="flex items-center gap-2 ">
          <Image
            src="/icons/icon-global-rank.svg"
            alt="Global rank icon"
            width={18}
            height={18}
            className="block"
          />
          <p className="font-serif font-bold">{restaurant.globalRank}</p>
        </div>
        <div className="flex items-center gap-2">
          <Image
            src="/icons/icon-rating.svg"
            alt="Rating icon"
            width={14}
            height={14}
            className="block"
          />
          <p className="font-medium leading-none m-0">
            {restaurant.rating.toFixed(1)}
            <span className="text-brand-steel">/10</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPin;
