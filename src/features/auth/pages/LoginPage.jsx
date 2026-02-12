import React, { useState } from "react";
import LoginForm from "../components/LoginForm.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import { authApi } from "../api/auth.api.js";
import logo from "../../../assets/logo/logo.png";

export default function LoginPage() {
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpPassword, setFpPassword] = useState("");
  const [fpPassword2, setFpPassword2] = useState("");
  const [fpErrors, setFpErrors] = useState({});
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);

  function openForgot() {
    setForgotOpen(true);
    setForgotStep("request");
    setFpOtp("");
    setFpPassword("");
    setFpPassword2("");
    setFpErrors({});
  }

  function closeForgot() {
    if (sendingOtp || resendingOtp || resetting) return;
    setForgotOpen(false);
    setForgotStep("request");
    setFpEmail("");
    setFpOtp("");
    setFpPassword("");
    setFpPassword2("");
    setFpErrors({});
  }

  async function handleSendOtp() {
    if (sendingOtp) return;

    const email = fpEmail.trim();
    if (!email) {
      setFpErrors({ email: "Email is required." });
      return;
    }

    setFpErrors({});
    setSendingOtp(true);
    try {
      const data = await authApi.forgotPassword({ email });
      setToast({
        open: true,
        tone: "success",
        message: data?.message || "Password reset OTP sent to your email."
      });
      setForgotStep("reset");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      setToast({ open: true, tone: "danger", message: msg });
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleResendOtp() {
    if (resendingOtp) return;

    const email = fpEmail.trim();
    if (!email) {
      setFpErrors({ email: "Email is required." });
      return;
    }

    setFpErrors({});
    setResendingOtp(true);
    try {
      const data = await authApi.resendOtp({ email });
      setToast({
        open: true,
        tone: "success",
        message: data?.message || "OTP resent successfully."
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP. Please try again.";
      setToast({ open: true, tone: "danger", message: msg });
    } finally {
      setResendingOtp(false);
    }
  }

  async function handleResetPassword() {
    if (resetting) return;

    const email = fpEmail.trim();
    const otp = fpOtp.trim();

    const nextErrors = {};
    if (!email) nextErrors.email = "Email is required.";
    if (!otp) nextErrors.otp = "OTP is required.";
    if (!fpPassword) nextErrors.password = "New password is required.";
    else if (String(fpPassword).length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!fpPassword2) nextErrors.password2 = "Confirm your new password.";
    else if (fpPassword2 !== fpPassword) nextErrors.password2 = "Passwords do not match.";

    if (Object.keys(nextErrors).length) {
      setFpErrors(nextErrors);
      return;
    }

    setFpErrors({});
    setResetting(true);
    try {
      const data = await authApi.resetPassword({
        email,
        otp,
        password: fpPassword,
        password_confirmation: fpPassword2
      });
      setToast({
        open: true,
        tone: "success",
        message: data?.message || "Password reset successful. You can now login with your new password."
      });
      closeForgot();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Password reset failed. Please try again.";
      setToast({ open: true, tone: "danger", message: msg });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="login">
      <div className="login__wrap">
        <div className="login__panel">
          <img className="login__logo" src={logo} alt="natakahii logo" />

          <div className="login__brand">
            <div className="login__brandText">
              <div className="login__title">Welcome back !</div>
              <div className="login__subtitle">Sign in to manage the platform</div>
            </div>
          </div>

          <LoginForm
            onError={(msg) => setToast({ open: true, tone: "danger", message: msg })}
          />

          <div className="rowEnd">
            <Button variant="ghost" size="sm" type="button" onClick={openForgot}>
              Forgot password?
            </Button>
          </div>

          <div className="login__hint">
            <span>Version</span>
            <span className="pill">v1.0</span>
          </div>
        </div>
      </div>

      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <Modal
        open={forgotOpen}
        title={forgotStep === "request" ? "Forgot password" : "Reset password"}
        onClose={closeForgot}
        className="modal--login"
        footer={
          forgotStep === "request" ? (
            <div className="rowEnd">
              <Button variant="secondary" onClick={closeForgot} disabled={sendingOtp}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSendOtp} loading={sendingOtp}>
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="rowBetween">
              <div className="row gap-sm">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (resetting || resendingOtp) return;
                    setForgotStep("request");
                    setFpOtp("");
                    setFpPassword("");
                    setFpPassword2("");
                    setFpErrors({});
                  }}
                  disabled={resetting || resendingOtp}
                >
                  Back
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleResendOtp}
                  loading={resendingOtp}
                  disabled={resetting}
                >
                  Resend OTP
                </Button>
              </div>
              <Button variant="primary" onClick={handleResetPassword} loading={resetting}>
                Reset Password
              </Button>
            </div>
          )
        }
      >
        {forgotStep === "request" ? (
          <div className="stack gap-md">
            <div className="muted">
              Enter your admin email address. We will send a one-time password (OTP) to reset
              your password.
            </div>
            <Input
              label="Email"
              placeholder="e.g admin@example.com"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              error={fpErrors.email}
              autoFocus
            />
          </div>
        ) : (
          <div className="stack gap-md">
            <div className="muted">
              Enter the OTP sent to your email and choose a new password.
            </div>
            <Input label="Email" value={fpEmail} disabled error={fpErrors.email} />
            <Input
              label="OTP"
              placeholder="e.g 123456"
              value={fpOtp}
              onChange={(e) => setFpOtp(e.target.value)}
              error={fpErrors.otp}
              inputMode="numeric"
              autoFocus
            />
            <div className="grid2">
              <Input
                label="New Password"
                placeholder="********"
                type="password"
                value={fpPassword}
                onChange={(e) => setFpPassword(e.target.value)}
                error={fpErrors.password}
              />
              <Input
                label="Confirm Password"
                placeholder="********"
                type="password"
                value={fpPassword2}
                onChange={(e) => setFpPassword2(e.target.value)}
                error={fpErrors.password2}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
