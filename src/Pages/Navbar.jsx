import  { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../Component/Notification"; 
import profielpic from "../assets/shila.jpeg"



import { UserContext } from "../App";


function Navbar() {
  let navigate = useNavigate();
  let { guser,setguser } = useContext(UserContext);
  // let isloggedin = localStorage.getItem("isloggedin");
  
  function handleLogout() {
    localStorage.removeItem("isloggedin");
    localStorage.removeItem("token");
    localStorage.removeItem("guser");
    setguser(null);
    navigate("/signin");
  }

  return (
    <>
    <nav className="bg-transparent text-white shadow-md max-w-7xl mx-auto px-4 flex justify-between items-center h-20">
      <div className="flex items-center gap-3 ">
        
          <Link  to="/">
           
          {/* <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-white text-3xl"> */}
  <div className="w-20 h-20 rounded-full overflow-hidden cursor-pointer flex items-center justify-center  border-2 border-lightpink-500">
  
  <img
    src={guser?.avatar || profielpic }
    alt="profiel"
    className="w-full h-full object-cover"
    
    />
</div>
{/* </div> */}
    </Link>
    <Link to="/">
          <h1 className="text-white text-xl font-bold hidden sm:block">
            Instagram
          </h1>
        </Link>
</div>
        
        <ul className="hidden md:flex space-x-8 text-white-700 hover:text-blue-500 border-transparent ">
          
          <li>
            <Link className="nav-link" to="/">
              Home
            </Link>
          </li>

          <li>
            <Link className="nav-link" to="/chat">
              chat
            </Link>
          </li>

          
          <li>
            <Link className="nav-link" to="/Contact">
               Contact
            </Link>
          </li>

          <li className="flex items-center gap-4">
            {guser ? (
              <div className="flex items-center gap-4">
                <NotificationBell/>
                <span className="text-sm font-semibold text-gray-200">
                Hi, {guser?.name || "User"}
              </span>
                
          <button 
            onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-all active:scale-95"
      >
        Logout
      </button>                
              </div>
            ) : (
              <>
                <Link className="nav-link" to="/signin">
                  Signin
                </Link>
                <Link className="nav-link" to="/signup">
                  SignUp
                </Link>
              </>
            )}
          </li>
        </ul>
      
      </nav>
    </>
  );
}

export default Navbar;
