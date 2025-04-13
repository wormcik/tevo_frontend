import { useLocation, useNavigate, Link } from "react-router-dom";
import { LogOut, UserCircle, ArrowLeftCircle } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isHomeOrMenu = currentPath === "/" || currentPath === "/menu";

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/giris");
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-20">
      {/* Sol: Menüye Dön */}
      <div>
        {!isHomeOrMenu && (
          <button
            onClick={() => navigate("/menu")}
            title="Menüye Dön"
            className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 font-medium"
          >
            <ArrowLeftCircle size={22} />
            <span>Menü</span>
          </button>
        )}
      </div>

      {/* Sağ: Profil + Kullanıcı Adı + Çıkış */}
      <div className="flex gap-4 items-center ml-auto">
        <Link
          to="/profile"
          title="Profilim"
          className="flex items-center text-blue-600 hover:text-blue-800 transition gap-1"
        >
          <UserCircle size={22} />
          <span className="hidden sm:inline text-sm font-medium">
            {user?.userName}
          </span>
        </Link>

        <button
          onClick={handleLogout}
          title="Çıkış Yap"
          className="text-red-500 hover:text-red-700 transition"
        >
          <LogOut size={22} />
        </button>
      </div>
    </nav>
  );
}
