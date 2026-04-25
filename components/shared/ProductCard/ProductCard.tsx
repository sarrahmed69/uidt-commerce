"use client";
import { BsStarFill, BsStar } from "react-icons/bs";
import ProductLike from "./ProductLike";
import Image from "next/image";
import dummyProduct from "@/public/images/63ec6053e5b15cfafd550cbb_Rectangle 1436-3.png";
import Link from "next/link";

interface ProductCardProps {
  thumbnail?: boolean;
  animate?: boolean;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    shortDescription: string;
  };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

const ProductCard = ({ thumbnail, product }: ProductCardProps) => {
  return (
    <div className="w-full max-w-full sm:max-w-[410px] hover:-translate-y-2 transition-transform duration-200 cursor-pointer">
      <div className="rounded-lg h-[280px] flex justify-center items-center relative overflow-hidden bg-gray-50">
        <Image
          src={dummyProduct}
          alt={product?.name || "Produit"}
          loading="lazy"
          quality={75}
          className="hover:scale-110 transition-transform duration-300 object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        <ProductLike productId={product?.id.toString()} />
      </div>
      {!thumbnail && (
        <div className="px-2 mt-2">
          <div className="flex justify-between items-center text-gray-700 text-base font-semibold">
            <span className="truncate">{product?.name}</span>
            <span className="whitespace-nowrap text-primary text-sm ml-2">{formatPrice(product?.price)}</span>
          </div>
          <p className="truncate text-xs text-gray-500 mt-1">{product?.shortDescription}</p>
          <div className="flex gap-1 mt-1.5">
            <BsStarFill className="size-3.5 text-orange-400" />
            <BsStar className="size-3.5 text-gray-300" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;