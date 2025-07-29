import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MenuFijoDistrito from "@/components/MenuFijoDistrito";

export default function RegistrosGrupoDistrito() {
  const { grupoId } = useParams();
  const token = localStorage.getItem("token");

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerRegistros = async () => {
    try {
      const gestionRes = await axios.get(
        "http://localhost:8080/api/gestion/activa",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const gestionId = gestionRes.data.id;

      const res = await axios.get(
        `http://localhost:8080/api/registrogestion/registros-por-grupo/${grupoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRegistros(res.data);
    } catch (err) {
      console.error("Error al obtener registros del grupo:", err);
      setError("No se pudieron cargar los registros.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  return (
    <div className="pt-6 pb-20 px-4">
      <MenuFijoDistrito />
      <h2 className="text-xl font-semibold mb-4 text-center">
        Registros enviados al distrito
      </h2>

      {cargando ? (
        <p className="text-center">Cargando registros del grupo...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : registros.length === 0 ? (
        <p className="text-center">No hay registros enviados por este grupo.</p>
      ) : (
        <div className="space-y-4">
          {registros.map((r) => (
            <div
              key={r.usuarioId}
              className="border rounded p-3 bg-white shadow-sm"
            >
              <p className="font-semibold">{r.nombreCompleto}</p>
              <p>CI: {r.ci}</p>
              <p>Rama: {r.rama}</p>
              <p>Unidad: {r.unidadNombre}</p>
              <p>Grupo: {r.grupoNombre}</p>
              <p>
                Estado:{" "}
                <span className={r.aprobadoDistrito ? "text-green-600" : "text-yellow-600"}>
                  {r.aprobadoDistrito ? "Aprobado" : "Pendiente"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
