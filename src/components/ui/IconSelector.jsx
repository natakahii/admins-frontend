import React, { useState } from "react";
import * as Icons from "react-icons/io5";
import { CATEGORY_ICONS } from "../../utils/iconsList.js";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

export default function IconSelector({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedIcon = CATEGORY_ICONS.find((i) => i.name === value);
  const IconComponent = value ? Icons[value] : null;

  const filteredIcons = CATEGORY_ICONS.filter((icon) =>
    icon.label.toLowerCase().includes(search.toLowerCase()) ||
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(iconName) {
    console.log('Icon selected:', iconName);
    onChange(iconName);
    setIsOpen(false);
    setSearch("");
  }

  function handleClear() {
    console.log('Icon cleared');
    onChange("");
    setIsOpen(false);
    setSearch("");
  }

  return (
    <>
      <label className="field">
        {label ? <span className="field__label">{label}</span> : null}
        
        <div className="iconSelector__selected" onClick={() => setIsOpen(true)}>
          {value && IconComponent ? (
            <>
              <IconComponent size={24} />
              <span>{selectedIcon?.label}</span>
            </>
          ) : (
            <span style={{ color: "#999" }}>Click to select an icon</span>
          )}
        </div>
      </label>

      {!value ? null : (
        <Button 
          type="button" 
          variant="secondary" 
          size="sm" 
          onClick={handleClear}
          style={{ marginTop: "8px" }}
        >
          Clear icon
        </Button>
      )}

      <Modal
        open={isOpen}
        title="Select Icon"
        onClose={() => {
          setIsOpen(false);
          setSearch("");
        }}
        footer={null}
      >
        <div className="stack gap-md">
          <input
            type="text"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ width: "100%" }}
          />

          <div className="iconSelector__grid">
            {filteredIcons.map((icon) => {
              const IconComp = Icons[icon.name];
              return (
                <button
                  key={icon.name}
                  type="button"
                  className={`iconSelector__option ${
                    value === icon.name ? "iconSelector__option--selected" : ""
                  }`}
                  onClick={() => handleSelect(icon.name)}
                  title={icon.label}
                >
                  {IconComp && <IconComp size={28} />}
                  <span className="iconSelector__label">{icon.label}</span>
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div style={{ textAlign: "center", color: "#999", padding: "20px" }}>
              No icons found
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
