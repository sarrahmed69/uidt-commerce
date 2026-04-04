"use client";

const FooterEnding = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-blue-200/40 pb-6 gap-y-3 border-t border-white/10 pt-5">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#c8a84b]" />
        <p>© {new Date().getFullYear()} UIDT Commerce. Tous droits reservés.</p>
      </div>
      <div className="flex items-center gap-x-5">
        <a href="/" className="hover:text-[#c8a84b] transition-colors duration-200">Confidentialite</a>
        <span className="text-white/20">·</span>
        <a href="/" className="hover:text-[#c8a84b] transition-colors duration-200">CGU</a>
        <span className="text-white/20">·</span>
        <a href="/" className="hover:text-[#c8a84b] transition-colors duration-200">Cookies</a>
      </div>
    </div>
  );
};
export default FooterEnding;