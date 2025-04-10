import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const navLinkClass = (path) =>
    `px-4 py-2 rounded transition ${
      location.pathname === path
        ? 'bg-blue-600 text-white'
        : 'text-blue-700 hover:bg-blue-100'
    }`;

  return (
    <nav className="bg-white shadow p-4 flex justify-center gap-4 sticky top-0 z-10">
      <Link to="" className={navLinkClass('')}>
        AnaSayfa
      </Link>
      <Link to="/musteri" className={navLinkClass('/musteri')}>
        Müşteriler
      </Link>
    </nav>
  );
}
