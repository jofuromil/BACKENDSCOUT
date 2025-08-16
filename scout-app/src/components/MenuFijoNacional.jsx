import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  CheckCircle2,
  BarChart3,
  MessageSquareText,
  CalendarDays,
} from "lucide-react";

export default function MenuFijoNacional() {
  const navigate = useNavigate();
  const location = useLocation();

  // Rutas del nivel nacional
  const items = [
    { to: "/nacional/panel", Icon: Home, label: "Inicio" },
    { to: "/nacional/aprobar-registros", Icon: CheckCircle2, label: "Aprobar" },
    { to: "/nacional/resumen", Icon: BarChart3, label: "Resumen" },
    { to: "/nacional/mensajes", Icon: MessageSquareText, label: "Mensajes" },
    { to: "/nacional/eventos", Icon: CalendarDays, label: "Eventos" },
  ];

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <>
      {/* Pantalla grande (arriba) */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 bg-white z-50 justify-around py-2 border-b border-green-200 shadow">
        {items.map(({ to, Icon, label }) => (
          <Boton
            key={to}
            icono={<Icon size={22} strokeWidth={2.25} />}
            onClick={() => navigate(to)}
            activo={isActive(to)}
            label={label}
          />
        ))}
      </div>

      {/* Pantalla pequeña (abajo) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white z-50 flex justify-around py-2 border-t border-green-200 shadow">
        {items.map(({ to, Icon, label }) => (
          <Boton
            key={to}
            icono={<Icon size={24} strokeWidth={2.25} />}
            onClick={() => navigate(to)}
            activo={isActive(to)}
            label={label}
          />
        ))}
      </div>
    </>
  );
}

function Boton({ icono, onClick, activo, label }) {
  // Solo icono (sin texto), con accesibilidad + estilo “verde claro por dentro, borde verde oscuro”
  const base =
    "flex items-center justify-center rounded-xl border-2 p-2 " +
    "text-green-800 bg-green-50 border-green-700/60 " +
    "hover:bg-green-100 hover:border-green-800 transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-green-300";
  const active =
    "bg-green-100 border-green-800 text-green-900 shadow-sm";

  return (
    <button
      onClick={onClick}
      className={`${base} ${activo ? active : ""}`}
      aria-label={label}
      title={label}
    >
      {icono}
    </button>
  );
}

