import React from "react";
import {
  IoMenu, IoClose, IoGrid, IoNotifications, IoPerson, IoPeople,
  IoStorefront, IoCube, IoReceipt, IoCard, IoShield, IoRefresh,
  IoLogOut, IoCar, IoWarning, IoHelpCircle, IoFlag, IoBarChart,
  IoSettings, IoTrendingUp, IoCash, IoDocument, IoCreate, IoCheckmarkCircle
} from 'react-icons/io5';

const iconComponents = {
  menu: IoMenu,
  x: IoClose,
  grid: IoGrid,
  bell: IoNotifications,
  user: IoPerson,
  users: IoPeople,
  store: IoStorefront,
  box: IoCube,
  receipt: IoReceipt,
  "credit-card": IoCard,
  shield: IoShield,
  "rotate-ccw": IoRefresh,
  "log-out": IoLogOut,
  truck: IoCar,
  "alert-triangle": IoWarning,
  "life-buoy": IoHelpCircle,
  flag: IoFlag,
  "bar-chart": IoBarChart,
  "user-cog": IoSettings,
  settings: IoSettings,
  percent: IoTrendingUp,
  "badge-dollar-sign": IoCash,
  "scroll-text": IoDocument,
  update: IoCreate,
  verify: IoCheckmarkCircle
};

export default function Icon({ name, size = 20, color }) {
  const IconComponent = iconComponents[name];
  
  if (!IconComponent) {
    return <span className="icon">•</span>;
  }

  return <IconComponent size={size} color={color} className="icon" />;
}
