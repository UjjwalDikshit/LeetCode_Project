

import { Route, Routes , Navigate} from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Homepage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";

function App(){

  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state)=>state.auth);
// https://chatgpt.com/share/688e3d7d-2454-8007-a827-bb2b481360dc
// https://chatgpt.com/share/688e41b6-7d24-8007-ab0a-83e21fb7b69d

  // check initial authentication
  // useEffect(()=>{
  //   dispatch(checkAuth());
  // },[dispatch]);

  console.log("yaha bhi thik hai");

  return (
    <>
    <Routes>
      <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to= "/signup"/>}> </Route>
      <Route path="/login" element={isAuthenticated ? <Navigate to= "/" />  :<Login /> }></Route>
      <Route path="/signup" element={isAuthenticated ? <Navigate to = "/" /> : <Signup></Signup>}/>

    </Routes>
    </>
  )
}

export default App; 