import { Suspense } from "react";
import ProductsLayout from "@/components/common/layouts/products/ProductsLayout";

const Deals = () => {
  return (
    <Suspense fallback={null}>
      <ProductsLayout />
    </Suspense>
  );
};

export default Deals;