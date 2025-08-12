import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MenuFijo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

export default function VerEspecialidadDetalle() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [especialidad, setEspecialidad] = useState(null);
  const [requisitos, setRequisitos] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/Especialidades/avance-especialidad?idEspecialidad=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setEspecialidad({
          nombre: data.nombre,
          descripcion: data.descripcion,
          imagenUrl: data.imagenUrl
        });
        setRequisitos(data.requisitos);
        console.log(data);
      })
      .catch((err) => console.error("Error al cargar especialidad", err));
  }, [id, token]);

  const seleccionarRequisito = (requisitoId) => {
    fetch("http://localhost:8080/api/Especialidades/requisito-cumplido", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ requisitoId })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al seleccionar requisito");
        setRequisitos((prev) =>
          prev.map((r) =>
            r.requisitoId === requisitoId
              ? { ...r, seleccionado: true, fechaSeleccion: new Date().toISOString() }
              : r
          )
        );
      })
      .catch((err) => console.error(err));
  };

  return (
    <div
          className="min-h-screen bg-white text-gray-800 flex flex-col pb-24 pt-15"
          style={{
            backgroundImage: `url(${fondoScout})`,
            backgroundRepeat: "repeat",
            backgroundSize: "contain"
          }}
        >
    <div className="min-h-screen pb-20">
      {/* Menú fijo superior para pantallas grandes */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-3xl mx-auto pt-6 px-4">
        {especialidad?.imagenUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={especialidad.imagenUrl}
              alt={especialidad.nombre}
              className="w-35 h-35 rounded-full object-cover"
            />
          </div>
        )}

        <h2 className="text-2xl font-bold mb-2 text-center">{especialidad?.nombre}</h2>
        <p className="mb-4 text-center">{especialidad?.descripcion}</p>

        {requisitos.length === 0 ? (
          <p className="text-gray-600">No hay requisitos disponibles.</p>
        ) : (
          <ul className="space-y-3">
            {requisitos.map((r) => (
              <li
                key={r.requisitoId}
                className="p-4 border rounded bg-gray-50 shadow"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{r.texto}</span>
                  {r.fechaAprobacion ? (
                    <span className="text-green-600 font-semibold">✔ Cumplido</span>
                  ) : r.seleccionado ? (
                    <span className="text-yellow-600 font-semibold">🟡 Seleccionado</span>
                  ) : (
                    <button
                      onClick={() => seleccionarRequisito(r.requisitoId)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Seleccionar
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  {r.fechaSeleccion && (
                    <p>📅 Seleccionado: {new Date(r.fechaSeleccion).toLocaleDateString()}</p>
                  )}
                  {r.fechaAprobacion && (
                    <p>✅ Aprobado: {new Date(r.fechaAprobacion).toLocaleDateString()}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Menú fijo inferior para móviles */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
    </div>
  );
}
