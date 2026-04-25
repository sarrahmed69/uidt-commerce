import { Suspense } from "react";
import ProductsLayout from "@/components/common/layouts/products/ProductsLayout";

const Search = () => {
  return (
    <Suspense fallback={null}>
      <ProductsLayout />
    </Suspense>
  );
};

export default Search;