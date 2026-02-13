import React, { useEffect, useRef, useState } from "react";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import Modal from "../ui/Modal.jsx";
import Icon from "./icons/Icon.jsx";
import { useAuth } from "../../app/providers/authContext.js";
import { useNavigate } from "react-router-dom";

export default function Topbar({ sectionTitle, sidebarOpen = false, onToggleSidebar }) {
  const { user, adminRole, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    function onClickOutside(e) {
      if (!menuOpen) return;
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setMenuOpen(false);
    }

    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  async function handleConfirmLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  }

  const tone = adminRole === "super_admin" ? "warning" : "primary";
  const displayName = user?.name || "Admin";
  const displayMeta = user?.email || user?.phone || "";
  const initial = (displayName?.trim()?.[0] || "A").toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__navToggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={sidebarOpen}
        >
          <Icon name={sidebarOpen ? "x" : "menu"} />
        </button>

        <div className="topbar__titles">
          <div className="topbar__title">{sectionTitle}</div>
          <div className="topbar__subtitle">Manage operations, vendors, content and platform settings</div>
        </div>
      </div>

      <div className="topbar__right" ref={menuRef}>
        <Badge tone={tone}>{adminRole || "admin"}</Badge>

        <button
          type="button"
          className="topbar__account"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="topbar__avatar" aria-hidden>
            {initial}
          </span>
          <span className="topbar__user">
            <span className="topbar__userName">{displayName}</span>
            <span className="topbar__userMeta">{displayMeta}</span>
          </span>
          <span className="topbar__chev" aria-hidden>
            ▾
          </span>
        </button>

        {menuOpen ? (
          <div className="topbar__menu" role="menu">
            <button
              type="button"
              className="topbar__menuItem"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
            >
              <Icon name="rotate-ccw" />
              Logout
            </button>
          </div>
        ) : null}
      </div>

      <Modal
        open={confirmOpen}
        title="Logout"
        onClose={() => (loggingOut ? null : setConfirmOpen(false))}
        footer={
          <div className="row rowEnd">
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={loggingOut}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmLogout} loading={loggingOut}>
              Logout
            </Button>
          </div>
        }
      >
        <div className="muted">Are you sure you want to sign out of the admin console?</div>
      </Modal>
    </header>
  );
}
