// src/pages/PanelDistrito.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuFijoDistrito from "@/components/MenuFijoDistrito";

export default function PanelDistrito() {
  const navigate = useNavigate();
  const [distritos, setDistritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const token = localStorage.getItem("token");
  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/DistritoUsuario/distritos/${usuarioId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.length === 0) {
          navigate("/login"); // No tiene acceso
          return;
        }

        setDistritos(res.data);
        setCargando(false);
      } catch (error) {
        console.error("Error al verificar acceso al distrito:", error);
        navigate("/login");
      }
    };

    verificarAcceso();
  }, []);

  if (cargando) return <p className="p-4">Cargando panel de distrito...</p>;

  return (
    <div className="pt-20 pb-24 px-4">
      <h1 className="text-2xl font-bold mb-4 text-purple-800">
        Panel del Distrito
      </h1>

      {distritos.map((d, i) => (
        <div
          key={i}
          className="border rounded-xl p-4 mb-4 bg-purple-50 shadow-sm"
        >
          <p><strong>Distrito:</strong> {d.nivelDistrito.nombre}</p>
          <p><strong>Rol:</strong> {d.rol}</p>
        </div>
      ))}

      {/* SECCIÓN 1: GESTIÓN REGISTROS */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-purple-700 mb-2">
          Gestión de Registros
        </h2>
        <div className="space-y-2">
          <button
            onClick={() => navigate("/distrito/registros")}
            className="w-full bg-purple-700 text-white px-4 py-2 rounded-xl shadow"
          >
            Gestión de Registros
          </button>
          <button
            onClick={() => navigate("/distrito/resumen-registros")}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded-xl shadow"
          >
            Ver resumen de registros
          </button>
          <button
            onClick={() => navigate("/distrito/listas-registros")}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded-xl shadow"
          >
            Ver listas de registros
          </button>
        </div>
      </div>

      {/* SECCIÓN 2: MENSAJES */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-purple-700 mb-2">Mensajes</h2>
        <div className="space-y-2">
          <button
            onClick={() => navigate("/distrito/mensajes/enviar")}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-xl shadow"
          >
            Enviar mensajes
          </button>
          <button
            onClick={() => navigate("/distrito/mensajes")}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-xl shadow"
          >
            Ver mensajes
          </button>
        </div>
      </div>

      {/* SECCIÓN 3: EVENTOS */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-purple-700 mb-2">Eventos</h2>
        <div className="space-y-2">
          <button
            onClick={() => navigate("/distrito/eventos/crear")}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-xl shadow"
          >
            Crear evento
          </button>
          <button
            onClick={() => navigate("/distrito/eventos/validar-inscripciones")}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-xl shadow"
          >
            Validar registros a eventos
          </button>
          <button
            onClick={() => navigate("/distrito/eventos")}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-xl shadow"
          >
            Ver eventos del distrito
          </button>
        </div>
      </div>

      {/* SECCIÓN 4: NIVELES */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-purple-700 mb-2">Niveles</h2>
        <div className="space-y-2">
          <button
            onClick={() => navigate("/panel-dirigente")}
            className="w-full bg-purple-400 text-white px-4 py-2 rounded-xl shadow"
          >
            Ir al Panel de Dirigente
          </button>
          <button
            onClick={() => navigate("/grupo")}
            className="w-full bg-purple-400 text-white px-4 py-2 rounded-xl shadow"
          >
            Ir al Panel de Grupo
          </button>
        </div>
      </div>

      <MenuFijoDistrito />
    </div>
  );
}
