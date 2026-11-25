import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { login } from "../redux/slices/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);
  if (isAuthenticated) return <Navigate to="/" replace />;
  const submit = async e => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) navigate("/");
  };
  return <main className="auth-page">
    <form className="auth-card" onSubmit={submit}>
      <div className="brand auth-brand">Form<span>Craft</span></div>
      <p className="eyebrow">ADMIN WORKSPACE</p>
      <h1>Welcome back</h1><p className="muted">Sign in to manage your forms and responses.</p>
      {error && <div className="alert">{error}</div>}
      <label>Email address<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required /></label>
      <button className="btn btn-primary btn-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
    </form>
  </main>;
}
