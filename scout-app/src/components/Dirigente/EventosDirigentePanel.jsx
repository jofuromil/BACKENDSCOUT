import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

const EventosDirigentePanel = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigoUnidad, setCodigoUnidad] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const cargarDatosUnidad = async () => {
      try {
        const res = await axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const codigo = res.data?.unidad?.codigoUnidad;
        setCodigoUnidad(codigo);

        if (codigo) {
          const eventosRes = await axios.get(`/api/Evento/unidad/${codigo}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEventos(eventosRes.data);
        }
      } catch (error) {
        console.error("Error al cargar los eventos:", error);
        alert("No se pudieron cargar los eventos de la unidad.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosUnidad();
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-white text-gray-800 flex flex-col pb-24 pt-20"
      style={{
        backgroundImage: `url(${fondoScout})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain"
      }}
    >
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Eventos de mi Unidad</h2>
      <button
        onClick={() => navigate("/dirigente/crear-evento")}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        ➕ Crear nuevo evento
      </button>

      {loading ? (
        <p>Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p>No se encontraron eventos.</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Lugar</th>
              <th className="py-2 px-4">Fecha</th>
              <th className="py-2 px-4">Nivel</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento) => (
              <tr key={evento.id} className="border-t">
                <td className="py-2 px-4">{evento.nombre}</td>
                <td className="py-2 px-4">{evento.lugar ?? "Sin especificar"}</td>
                <td className="py-2 px-4">
                  {new Date(evento.fechaInicio).toLocaleDateString()} -{" "}
                  {new Date(evento.fechaFin).toLocaleDateString()}
                </td>
                <td className="py-2 px-4">{evento.nivel}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => navigate(`/dirigente/evento-detalle/${evento.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Ver evento
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </div>
  );
};

export default EventosDirigentePanel;
