import React, { useState } from "react";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import { useAuth } from "../../../app/providers/authContext.js";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onError }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({
        email_or_phone: emailOrPhone.trim(),
        password,
        device_name: "natakahii-admin-web"
      });

      const role = user?.admin_role || user?.role;
      if (role === "super_admin") {
        navigate("/app/admin/dashboard", { replace: true });
      } else {
        navigate("/app/admin/dashboard", { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Check credentials and try again.";
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <Input
        label="Email"
        placeholder="e.g admin@example.com"
        value={emailOrPhone}
        onChange={(e) => setEmailOrPhone(e.target.value)}
        required
      />
      <Input
        label="Password"
        placeholder="********"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" loading={loading}>
        Sign In
      </Button>
    </form>
  );
}
