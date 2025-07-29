import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Target,
  Mail,
  Star,
  User,
} from "lucide-react";

export default function MenuFijo() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("tipo")?.toLowerCase();
    setTipo(t);
  }, []);

  const botonesScout = [
    { icono: <Home />, texto: "Inicio", ruta: "/panel-scout" },
    { icono: <Target />, texto: "Objetivos", ruta: "/scout/objetivos" },
    { icono: <Mail />, texto: "Mensajes", ruta: "/mensajes-recibidos" },
    { icono: <Star />, texto: "Especialidades", ruta: "/registrar-avance-especialidades" },
    { icono: <User />, texto: "Yo", ruta: "/kardex" },
  ];

  const botonesDirigente = [
    { icono: <Home />, texto: "Inicio", ruta: "/panel-dirigente" },
    { icono: <Target />, texto: "Objetivos", ruta: "/dirigente/validar-objetivos" },
    { icono: <Mail />, texto: "Mensajes", ruta: "/Mensajes-Unidad" },
    { icono: <Star />, texto: "Especialidades", ruta: "/dirigente/especialidades" },
    { icono: <User />, texto: "Yo", ruta: "/perfil" },
  ];

  const botones = tipo === "dirigente" ? botonesDirigente : botonesScout;

  if (!tipo || location.pathname.startsWith("/login") || location.pathname.startsWith("/registro")) {
    return null; // no mostrar en páginas con fondo violeta o sin tipo
  }

  return (
    <div className="bg-white border-t border-gray-300 flex justify-around py-2 z-50">
      {botones.map((btn, i) => (
        <button
          key={i}
          onClick={() => navigate(btn.ruta)}
          className="flex flex-col items-center text-purple-700 hover:text-purple-900 text-sm font-semibold"
        >
          {btn.icono}
          <span className="text-xs mt-1">{btn.texto}</span>
        </button>
      ))}
    </div>
  );
}
