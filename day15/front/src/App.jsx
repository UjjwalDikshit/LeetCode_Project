

import { Route, Routes , Navigate} from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";
import AdminPanel from "./pages/AdminPanel";


function App(){

  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state)=>state.auth);

  
  // check initial authentication
  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch]);

  console.log("yaha bhi thik hai");

  return (
    <>
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to= "/signup"/>}> </Route>
      <Route path="/login" element={isAuthenticated ? <Navigate to= "/" />  :<Login /> }></Route>
      <Route path="/signup" element={isAuthenticated ? <Navigate to = "/" /> : <Signup></Signup>}/>
      <Route path="/admin" element = {<AdminPanel/>}></Route>
{/* 
      <Route 
      path = '/admin'
      element={
        isAuthenticated && user?.role === "admin" ? 
        <AdminPanel/>:<Navigate to = "/"/>
      }/> */}


    </Routes>
    </>
  )
}

export default App; 