import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../App";

const SignUp = () => {
  const navigate = useNavigate();
  const { setguser } = useContext(UserContext);
  let [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handler(event) {
    setUser({ ...user, [event.target.name]: event.target.value });
    // console.log(event.target.value);
  }

  const shandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        let response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/signup`, {        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      let data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isloggedin", "true");
        localStorage.setItem("guser", JSON.stringify(data.user));
        setguser(data.user);
        navigate("/");
      } else {
        alert(data.message || "Signup failed!");
        localStorage.removeItem("isloggedin");
      }
    } catch (error) {
      console.error("signup Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full h-screen flex justify-center items-center bg-gray-100">
        <form
          onSubmit={shandler}
          className="w-[350px] bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-5"
        >
          <h2 className="text-3xl font-bold text-center text-gray-800">
            SignUp
          </h2>
          <label htmlFor="name" className="text-gray-700 font-medium">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={user.name}
            onChange={handler}
            required={true}
            className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
          />
          {""}

          <label htmlFor="email">email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={user.email}
            onChange={handler}
            required={true}
            className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
          />
          {""}

          <label htmlFor="password" className="text-gray-700 font-medium">
            password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={user.password}
            onChange={handler}
            className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
            required={true}
          />
          {""}

          <label htmlFor="phone" className="text-gray-700 font-medium">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            id="phone"
            value={user.phone}
            onChange={handler}
            required={true}
            className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg text-white font-semibold transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 active:scale-95"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                {/* Small Inline CSS Spinner */}
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing Up...</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
                    <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-500 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default SignUp;
