import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {  useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../App";

const SignIn = () => {
  const navigate = useNavigate();
  let {setguser} = useContext(UserContext);
  const [user, setUser] = useState({
    login: "",
    password: "",
  });
  const [showPassword, setShowpassword] = useState(false);
  


  const handler = (e) => {
   
    setUser({ ...user, [e.target.name]: e.target.value });
    

  };

  const shandler = async (e) => {
    e.preventDefault();
    
    console.log(user);
    try {
     let response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/signin`, {        method: "POST",
        headers: {
          "Content-Type": "application/json",

         },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      console.log(data);
      
      if (data.success) {
  const loggedInUser = {
    ...data.user,
    avatar: "",
  };

  localStorage.setItem("isloggedin", "true");
  localStorage.setItem("token", data.token );
  localStorage.setItem("guser", JSON.stringify(loggedInUser));

  setguser(loggedInUser);
  navigate("/");
} else {
  alert(data.message || "Invalid credentials");
}
    } catch (error) {
      console.log("signin fail", error);
    }
  };
  return (
    <>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
        <div className=" border border-Zinc-500 bg-gray-800 rounded-sm w-full max-w[350px] p-10">
          <h1 className="font-serif text-4xl font-semibold mb-8 text-white">
            Log into instagram
          </h1>
          <form onSubmit={shandler} className="w-full flex flex-col gap-2">
            <div className="w-full ">
              <div>
                {/* <label htmlFor="exampleInputEmail" ></label> */}
                <input
                  type="text"
                  name="login"  
                  id="text"
                  placeholder="Mobile number,username or email, "
                  onChange={handler}
                  value={user.login}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 hover:border-white  text-white rounded-lg px-2 py-2 m-2 text-xs focus:outline-none focus:border-gray-400 placeholder-zinc-400 "
                />{" "}
                <br />
              </div>

              {/* <label htmlFor="exampleInputEmail" className="">
                Paasword
              </label> */}

              <div className="w-full relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Password"
                  onChange={handler}
                  value={user.password}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 hover:border-white  m-2 text-white rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-gray-400 placeholder-zinc-400 "
                />
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  onClick={() => setShowpassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#daa520]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white font-semibold text-sm py-1.5 rounded-sm"
            >
              SignIn
            </button>
          </form>
        </div>

        <div className="border border-zinc-800 bg-black rounded-sm w-full max-w-[350px] py-5 mt-3 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <a href="#" className="text-[#0095f6] font-semibold hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </>
  );
};

export default SignIn;
