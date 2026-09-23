import  { createContext, useState } from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './App.css';



import { Home, Chat, Contact,  SignUp, Signin } from "./Pages";
import MainLayout from "./Pages/MainLayout";
import { Protected } from "./Component";


let router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        element: (
          <>
            <Protected />
          </>
        ),
        children: [
          {
            // path: "/",
            index: true,
            element: (
              <>
                <Home />
              </>
            ),
          },

      //     {
      //   path: "Home",
      //   element: <Navigate to="/" replace />,
      // },

          {
            path: "/chat",
            element: (
              <>
                <Chat />
              </>
            ),
          },
          {
            path: "/Contact",
            element: (
              <>
                <Contact />
              </>
            ),
          },
        ],
      },
      {
        path: "/signup",
        element: (
          <>
            <SignUp />
          </>
        ),
      },
      {
        path: "/signin",
        element: (
          <>
            <Signin />
          </>
        ),
      },
    ],
  },
]);

let UserContext = createContext();
function App() {
  let [guser, setguser] = useState(() =>{
    try {
      const savedUser = localStorage.getItem("guser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("error", error);
      
      return null;
    }
  });
  
    
  return (
    <>
      <UserContext.Provider value={{ guser, setguser }}>
        <RouterProvider router={router} />
      </UserContext.Provider>
      {/* <Card /> */}
    </>
  );
}

export default App;
export { UserContext };
