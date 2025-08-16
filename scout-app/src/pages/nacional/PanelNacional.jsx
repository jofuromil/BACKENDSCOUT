// src/pages/nacional/PanelNacional.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuFijoDistrito from "@/components/MenuFijoNacional";
import MenuFijoNacional from "../../components/MenuFijoNacional";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";

// Clase base para todos los botones “tarjeta/acción” en verde claro con borde verde oscuro
const BTN =
  "w-full bg-green-50 text-green-900 border-2 border-green-800 rounded-xl px-4 py-2 shadow-sm " +
  "hover:bg-green-100 hover:shadow-md transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-green-300";

export default function PanelNacional() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/nacional/soy-admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data?.esAdminNacional) {
          navigate("/login");
          return;
        }
        setCargando(false);
      } catch (error) {
        console.error("Error al verificar acceso nacional:", error);
        navigate("/login");
      }
    };

    if (!token) {
      navigate("/login");
      return;
    }
    verificarAcceso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cargando) return <p className="p-4">Cargando panel nacional...</p>;

  return (
    <div className="pt-20 pb-24 px-4">
      {/* Título solicitado, color predominante verde */}
      <h1 className="text-2xl font-bold mb-4 text-green-700">
        Asociación de Scouts de Bolivia
      </h1>
      <h1 className="text-2xl font-bold mb-4 text-green-600">
        Panel Nacional
      </h1>

      {/* Tarjeta de info */}
      <div className="border rounded-xl p-4 mb-4 bg-green-50 shadow-sm">
        <p className="text-green-800">
          Acceso: <strong>Admin Nacional</strong>
        </p>
      </div>

      {/* SECCIÓN 1: GESTIÓN REGISTROS */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-green-700 mb-2">
          Gestión de Registros
        </h2>
        <div className="space-y-2">
          <button onClick={() => navigate("/nacional/aprobar-registros")} className={BTN}>
            Aprobar registros
          </button>
          <button onClick={() => navigate("/nacional/resumen")} className={BTN}>
            Ver resumen nacional
          </button>
          <button onClick={() => navigate("/nacional/listas")} className={BTN}>
            Ver listas nacionales
          </button>
        </div>
      </div>

      {/* SECCIÓN 2: MENSAJES */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-green-700 mb-2">Mensajes</h2>
        <div className="space-y-2">
          <button onClick={() => navigate("/nacional/mensajes/enviar")} className={BTN}>
            Enviar mensajes
          </button>
          <button onClick={() => navigate("/nacional/mensajes")} className={BTN}>
            Ver mensajes
          </button>
        </div>
      </div>

      {/* SECCIÓN 3: EVENTOS */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-green-700 mb-2">Eventos</h2>
        <div className="space-y-2">
          <button onClick={() => navigate("/nacional/eventos/crear")} className={BTN}>
            Crear evento
          </button>
          <button
            onClick={() => navigate("/nacional/eventos/validar-inscripciones")}
            className={BTN}
          >
            Validar registros a eventos
          </button>
          <button onClick={() => navigate("/nacional/eventos")} className={BTN}>
            Ver eventos nacionales
          </button>
        </div>
      </div>

      {/* SECCIÓN 4: NIVELES */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-green-700 mb-2">Niveles</h2>
        <div className="space-y-2">
          <button onClick={() => navigate("/distrito")} className={BTN}>
            Ir al Panel de Distrito
          </button>
          <button onClick={() => navigate("/panel-dirigente")} className={BTN}>
            Ir al Panel de Dirigente
          </button>
          <button onClick={() => navigate("/grupo")} className={BTN}>
            Ir al Panel de Grupo
          </button>
        </div>
      </div>

      {/* Mantengo el componente fijo (cuando tengas MenuFijoNacional, lo reemplazamos) */}
      <MenuFijoNacional />
    </div>
  );
}


