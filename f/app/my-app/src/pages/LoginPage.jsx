// src/pages/LoginPage.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { api } from "../lib/api"; // 你的 axios instance

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [username, setU] = useState("");
  const [password, setP] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    const { data } = await api.post("/api/token/", { username, password });
    localStorage.setItem("access_token", data.access);
    nav(from, { replace: true });
  }

  return (
    <form onSubmit={onSubmit} style={{ padding: 20 }}>
      <input placeholder="Username" value={username} onChange={e => setU(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setP(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
