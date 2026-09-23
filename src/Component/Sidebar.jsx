import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faComments, faAddressBook } from "@fortawesome/free-solid-svg-icons";

function Sidebar({ onLinkClick }) {
  const location = useLocation();

  const links = [
    { name: "Home", path: "/", icon: faHouse },
    { name: "Chat", path: "/chat", icon: faComments },
    { name: "Contact", path: "/Contact", icon: faAddressBook },
  ];

  return (
    <div className="w-64 h-full bg-gray-900 text-white border-r border-gray-800 p-4 flex flex-col gap-2">
      <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 px-3">
        Navigation
      </h2>

      {links.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="text-base" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default Sidebar;