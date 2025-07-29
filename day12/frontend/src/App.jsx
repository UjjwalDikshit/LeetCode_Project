

import { Route, Routes } from "react-router";
import Login from "./pages/Login"
import Signup from "./pages/Signup";
import Home from "./pages/HomePage";

function App(){

  return (
    <>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup/>}/>

    </Routes>
    </>
  )
}

export default App; 