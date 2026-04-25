import Link from "next/link";
import useBrowserWidth from "@/hooks/useBrowserWidth";

interface NavItem {
  key: string;
  title: string;
  href: string;
}
interface NavItemsProps {
  navItems: NavItem[];
  activePage: number;
  handlePageChange: (index: number) => void;
  onEnterClick: (event: React.KeyboardEvent<HTMLLIElement>, index: number) => void;
}

const NavItems: React.FC<NavItemsProps> = ({
  navItems,
  activePage,
  handlePageChange,
  onEnterClick,
}) => {
  const { isMobile } = useBrowserWidth();
  return (
    <ul
      role="menubar"
      className={`flex items-center ${
        isMobile ? "flex-col justify-start text-xl" : "justify-center gap-x-8"
      }`}
    >
      {navItems.map((navItem, i) => (
        <li
          key={navItem.key}
          role="menuitem"
          className="text-gray-600 relative whitespace-nowrap flex flex-col justify-center items-center gap-x-1 cursor-pointer"
          onClick={() => handlePageChange(i)}
          onKeyDown={(event) => onEnterClick(event, i)}
          tabIndex={0}
          aria-current={activePage === i ? "page" : undefined}
        >
          <Link
            href={navItem.href}
            title={navItem.title}
            aria-label={navItem.title}
            className="py-1 hover:text-[#2B3090] transition-colors duration-200"
          >
            {navItem.title}
          </Link>
          <span
            className="block h-[2px] rounded-full transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: "#2B3090",
              width: activePage === i ? "100%" : "0%",
            }}
          />
        </li>
      ))}
    </ul>
  );
};

export default NavItems;