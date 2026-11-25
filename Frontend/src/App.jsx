import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FormEditor from "./pages/FormEditor";
import PublicForm from "./pages/PublicForm";
import Submissions from "./pages/Submissions";

function Layout({children}) {
  const location=useLocation();
  const authenticated=useSelector(s=>s.auth.isAuthenticated);
  return <>{authenticated && !location.pathname.startsWith("/public/") && <Navbar/>}{children}</>;
}
export default function App(){
  return <BrowserRouter><Layout><Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/public/:id" element={<PublicForm/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/forms/new" element={<FormEditor/>}/>
      <Route path="/forms/:id/edit" element={<FormEditor/>}/>
      <Route path="/submissions" element={<Submissions/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Layout></BrowserRouter>;
}
