import { Suspense } from "react";
import ProductsLayoutHero from "./ProductsLayoutHero"
import ProductsLayoutMain from "./ProductsLayoutMain"

const ProductsLayout = () => {
  return (
    <Suspense fallback={<div className="h-12 bg-gray-100 animate-pulse rounded" />}>
      <ProductsLayoutHero/>
      <ProductsLayoutMain/>
    </Suspense>
  )
}

export default ProductsLayout