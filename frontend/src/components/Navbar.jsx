import { Link } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#D6DAC8] bg-[#FBF3D5]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-stone-900"
        >
          Blog
        </Link>

        <nav className="flex items-center gap-2">
          <ProfileMenu />
        </nav>
      </div>
    </header>
  );
}
