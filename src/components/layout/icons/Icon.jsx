import React from "react";

const icons = {
  grid: "▦",
  users: "👥",
  store: "🏪",
  box: "📦",
  receipt: "🧾",
  "credit-card": "💳",
  shield: "🛡️",
  "rotate-ccw": "↩️",
  truck: "🚚",
  "alert-triangle": "⚠️",
  "life-buoy": "🛟",
  flag: "🚩",
  "bar-chart": "📊",
  "user-cog": "🧑‍💼",
  settings: "⚙️",
  percent: "％",
  "badge-dollar-sign": "💰",
  "scroll-text": "📜"
};

export default function Icon({ name }) {
  return <span className="icon">{icons[name] || "•"}</span>;
}
