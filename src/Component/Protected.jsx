


import  { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../App";

const Protected = () => {
  const { guser } = useContext(UserContext);
  console.log(guser)

  return guser ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default Protected;