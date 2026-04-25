import Link from "next/link";
import Image from "next/image";

const NavbarLogo = () => (
  <Link href="/" title="KaayJend — Accueil" aria-label="KaayJend — Accueil"
    className="flex items-center group">
    <Image
      src="/images/kayjend-logo-new.png"
      alt="KaayJend"
      width={130}
      height={42}
      priority
      quality={75}
      sizes="130px"
      className="object-contain group-hover:scale-105 transition-transform duration-200"
      style={{ width: "auto", height: 42 }}
    />
  </Link>
);

export default NavbarLogo;