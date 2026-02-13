import React, { useEffect, useRef, useState } from "react";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import Modal from "../ui/Modal.jsx";
import Icon from "./icons/Icon.jsx";
import Input from "../ui/Input.jsx";
import { authApi } from "../../features/auth/api/auth.api.js";
import { useAuth } from "../../app/providers/authContext.js";
import { useNavigate } from "react-router-dom";

export default function Topbar({ sectionTitle, sidebarOpen = false, onToggleSidebar }) {
  const { user, adminRole, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoRemoving, setPhotoRemoving] = useState(false);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    if (!accountOpen) return;
    setProfileForm({ name: user?.name || "", phone: user?.phone || "" });
    setProfileStatus(null);
  }, [accountOpen, user]);

  async function handleConfirmLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate("/", { replace: true });
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (profileSaving) return;
    setProfileStatus(null);
    setProfileSaving(true);
    try {
      await authApi.updateProfile({
        name: profileForm.name?.trim(),
        phone: profileForm.phone?.trim() || null
      });
      await refreshProfile?.();
      setProfileStatus({ type: "success", message: "Profile updated." });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to update profile.";
      setProfileStatus({ type: "error", message });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleUploadPhoto(file) {
    if (!file) return;
    setProfileStatus(null);
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      await authApi.uploadProfilePicture(formData);
      await refreshProfile?.();
      setProfileStatus({ type: "success", message: "Profile photo updated." });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to upload photo.";
      setProfileStatus({ type: "error", message });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPhotoUploading(false);
    }
  }

  async function handleRemovePhoto() {
    if (photoRemoving) return;
    setProfileStatus(null);
    setPhotoRemoving(true);
    try {
      await authApi.deleteProfilePicture();
      await refreshProfile?.();
      setProfileStatus({ type: "success", message: "Profile photo removed." });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to remove photo.";
      setProfileStatus({ type: "error", message });
    } finally {
      setPhotoRemoving(false);
    }
  }

  const avatarSrc = user?.profile_photo;
  const tone = adminRole === "super_admin" ? "warning" : "primary";
  const displayName = user?.name || "Admin";
  const displayMeta = user?.email || user?.phone || "";
  const initial = (displayName?.trim()?.[0] || "A").toUpperCase();

  const canCloseAccount = !(profileSaving || photoUploading || photoRemoving || loggingOut);

  function closeAccountModal() {
    if (!canCloseAccount) return;
    setAccountOpen(false);
  }

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
                setAccountOpen(true);
              }}
            >
              <Icon name="user" />
              Profile & Logout
            </button>
            <button
              type="button"
              className="topbar__menuItem"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setAccountOpen(true);
              }}
            >
              <Icon name="rotate-ccw" />
              Logout
            </button>
          </div>
        ) : null}
      </div>

      <Modal
        open={accountOpen}
        title="Account"
        onClose={closeAccountModal}
        footer={null}
        className="profileModal"
      >
        <div className="profileModal__section">
          <div className="profileModal__avatar" aria-hidden>
            {avatarSrc ? <img src={avatarSrc} alt={`${displayName} avatar`} /> : <span>{initial}</span>}
          </div>
          <div className="profileModal__photoActions">
            <div className="muted">Update your profile photo</div>
            <div className="row gap-sm">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                loading={photoUploading}
              >
                Upload photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={!avatarSrc || photoRemoving}
                loading={photoRemoving}
                onClick={handleRemovePhoto}
              >
                Remove
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleUploadPhoto(e.target.files?.[0])}
            />
            <div className="profileModal__hint">PNG or JPG, max 2MB.</div>
          </div>
        </div>

        <form className="profileModal__form" onSubmit={handleSaveProfile}>
          <Input
            label="Full name"
            name="name"
            value={profileForm.name}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Phone"
            name="phone"
            value={profileForm.phone || ""}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <Input label="Email" value={user?.email || ""} readOnly disabled />
          <div className="row rowEnd gap-sm profileModal__actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setProfileForm({ name: user?.name || "", phone: user?.phone || "" })}
              disabled={profileSaving}
            >
              Reset
            </Button>
            <Button type="submit" variant="primary" loading={profileSaving}>
              Save changes
            </Button>
          </div>
        </form>

        {profileStatus ? (
          <div className={`alert ${profileStatus.type === "error" ? "alert--danger" : "alert--success"}`}>
            {profileStatus.message}
          </div>
        ) : null}

        <div className="profileModal__section profileModal__logout">
          <div>
            <div className="profileModal__logoutTitle">Logout</div>
            <div className="muted">Are you sure you want to sign out?</div>
          </div>
          <div className="row gap-sm">
            <Button type="button" variant="secondary" onClick={closeAccountModal} disabled={!canCloseAccount}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleConfirmLogout} loading={loggingOut}>
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
