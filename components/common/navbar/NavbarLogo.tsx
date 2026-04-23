import Link from "next/link";

const NavbarLogo = () => (
  <Link href="/" title="KayJend — Accueil" aria-label="KayJend — Accueil"
    className="flex items-center group">
    <span
      className="font-black text-2xl md:text-3xl tracking-tight leading-none group-hover:scale-105 transition-transform duration-200 select-none"
      style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}
    >
      <span style={{ color: "#1e4a9e" }}>Kay</span><span style={{ color: "#F5A623" }}>Jënd</span>
    </span>
  </Link>
);

export default NavbarLogo;