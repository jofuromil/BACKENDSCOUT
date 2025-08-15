import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuFijoDistrito from "@/components/MenuFijoDistrito";
import axios from "axios";

export default function RegistrosDistrito() {
  const navigate = useNavigate();
  const [distritoNombre, setDistritoNombre] = useState("");
  const [distritoId, setDistritoId] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const token = localStorage.getItem("token");
  const usuarioId = localStorage.getItem("usuarioId");

  useEffect(() => {
    const roles = JSON.parse(localStorage.getItem("rolesDistrito") || "[]");

    const rolValido = roles.some((r) =>
      ["AdminDistrito", "GestionDistrito"].includes(r.rol)
    );

    if (!rolValido) {
      navigate("/login");
      return;
    }

    const distrito = roles[0]?.nivelDistrito?.nombre || "Distrito";
    const distritoId = roles[0]?.nivelDistritoId || roles[0]?.nivelDistrito?.id;

    setDistritoNombre(distrito);
    setDistritoId(distritoId);

    const cargarResumen = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/registrogestion/resumen-distrito/${distritoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGrupos(res.data);
      } catch (error) {
        console.error("Error al obtener resumen:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarResumen();
  }, []);

  const irADetalleGrupo = (grupoId) => {
    navigate(`/distrito/registros/${grupoId}`);
  };

  if (cargando) {
    return <div className="p-6">Cargando registros...</div>;
  }

  return (
    <div className="pt-20 pb-24 px-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-800 mb-2">
        {distritoNombre}
      </h1>
      <h2 className="text-xl font-semibold mb-6">
        Registros de los Grupos Scouts
      </h2>

      {grupos.length === 0 ? (
        <p className="text-gray-600">No hay registros enviados por los grupos.</p>
      ) : (
        grupos.map((grupo) => {
          const pendientes = grupo.enviados - grupo.aprobados;

          return (
            <div
              key={grupo.grupoId}
              className="border rounded-xl p-4 mb-4 bg-purple-50 shadow-sm"
            >
              <p className="font-semibold text-lg">{grupo.nombreGrupo}</p>
              <p>
                Registros recibidos: <strong>{grupo.enviados}</strong>
              </p>
              <p>
                Registros aprobados: <strong>{grupo.aprobados}</strong>
              </p>
              {pendientes > 0 && (
                <p className="text-red-600 mt-1">
                  Existen registros por aprobar
                </p>
              )}
              <div className="mt-3">
                <button
                  onClick={() => irADetalleGrupo(grupo.grupoId)}
                  className="bg-purple-700 text-white px-4 py-2 rounded-xl"
                >
                  Aprobar registros
                </button>
              </div>
            </div>
          );
        })
      )}

      <MenuFijoDistrito />
    </div>
  );
}
