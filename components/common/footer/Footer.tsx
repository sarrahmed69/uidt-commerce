"use client";
import footerLinks from "./footerlinks";
import MainLayout from "../layouts/main/MainLayout";
import FooterEnding from "./FooterEnding";
import FooterLinksList from "./FooterLinksList";
import FooterLogo from "./FooterLogo";
import { usePathname } from "next/navigation";
import { EXCLUDED_PATHS } from "@/lib/constants";

const Footer = () => {
  const pathname = usePathname();
  const shouldDisplayFooter = !EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
  if (!shouldDisplayFooter) return null;

  return (
    <MainLayout>
      <footer className="flex lg:flex-row flex-col gap-y-10 mt-12 mb-6 border-y border-gray-200 py-10 gap-x-16">
        <div className="w-full lg:w-1/3">
          <FooterLogo />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 w-full items-start">
          {footerLinks?.map((footerLink) => (
            <FooterLinksList key={footerLink.title} title={footerLink.title} links={footerLink.links} />
          ))}
        </div>
      </footer>
      <FooterEnding />
    </MainLayout>
  );
};

export default Footer;