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

      {/* Aquí puedes ir agregando botones para las funciones reales */}
      <div className="mt-6 space-y-3">
        <button
          onClick={() => navigate("/distrito/registros")}
          className="w-full bg-purple-700 text-white px-4 py-2 rounded-xl shadow"
        >
          Validar registros enviados
        </button>
        {/* Más botones para: crear eventos, ver listas por grupo, etc. */}
      </div>

      <MenuFijoDistrito />
    </div>
  );
}
