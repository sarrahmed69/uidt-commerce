"use client";
import Hero from "@/screens/home/widgets/Hero";
import TopCategories from "@/screens/home/widgets/TopCategories";
import TrendingProducts from "@/screens/home/widgets/TrendingProducts";
import TopVendors from "@/screens/home/widgets/TopVendors";
import NewsLetter from "@/screens/home/widgets/NewsLetter";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <TopCategories />
      <TrendingProducts />
      <TopVendors />
      <NewsLetter />
    </main>
  );
}