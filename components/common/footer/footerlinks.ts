const footerLinks = [
  {
    title: "Categories",
    links: [
      { name: "Livres & Cours", href: "/produits?categorie=livres" },
      { name: "Electronique", href: "/produits?categorie=electronique" },
      { name: "Vetements & Mode", href: "/produits?categorie=mode" },
      { name: "Alimentation", href: "/produits?categorie=alimentation" },
      { name: "Services", href: "/produits?categorie=services" },
      { name: "Toutes les categories", href: "/categories" },
    ],
  },
  {
    title: "KayJend",
    links: [
      { name: "A propos", href: "/" },
      { name: "Comment ca marche", href: "/" },
      { name: "Devenir vendeur", href: "/devenir-vendeur" },
      { name: "Vendeurs verifies", href: "/vendeurs" },
    ],
  },
  {
    title: "Aide & Support",
    links: [
      { name: "Centre d'aide", href: "/" },
      { name: "Nous contacter", href: "/" },
      { name: "Creer un compte", href: "/auth/sign-up" },
      { name: "Connexion", href: "/auth/sign-in" },
      { name: "FAQ", href: "/" },
    ],
  },
];

export default footerLinks;