import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);
  const signOut = () => { dispatch(logout()); navigate("/login"); };
  return <header className="topbar">
    <NavLink to="/" className="brand">Form<span>Craft</span></NavLink>
    <nav>
      <NavLink to="/">Forms</NavLink>
      <NavLink to="/submissions">Submissions</NavLink>
      <span className="user-name">{user?.name || "Administrator"}</span>
      <button className="btn btn-outline btn-small" onClick={signOut}>Sign out</button>
    </nav>
  </header>;
}
