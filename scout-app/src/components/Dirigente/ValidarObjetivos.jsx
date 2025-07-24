import { useEffect, useState } from "react";
import axios from "axios";

function ValidarObjetivos() {
  const [objetivosPendientes, setObjetivosPendientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarTodosLosPendientes();
  }, []);

  const cargarTodosLosPendientes = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/Objetivo/pendientes-por-unidad-dto", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setObjetivosPendientes(response.data);
    } catch (error) {
      console.error("Error al cargar objetivos pendientes", error);
    }
  };

  const validarObjetivo = async (objetivoId) => {
    try {
      setCargando(true);
      const payload = JSON.parse(atob(token.split('.')[1]));
      const dirigenteId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub;

      await axios.post(
        `http://localhost:8080/api/Objetivo/validar?dirigenteId=${dirigenteId}&seleccionId=${objetivoId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("✅ Objetivo validado exitosamente.");
      setObjetivosPendientes(prev => prev.filter(obj => obj.id !== objetivoId));
    } catch (error) {
      console.error("Error al validar objetivo", error);
      alert("❌ Hubo un error al validar el objetivo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Validación de Objetivos de la Unidad</h2>
      {objetivosPendientes.length === 0 ? (
        <p>No hay objetivos pendientes en la unidad.</p>
      ) : (
        <ul className="space-y-4">
          {objetivosPendientes.map((obj) => (
            <li
              key={obj.idSeleccion}
              className="border p-3 rounded shadow flex justify-between items-start"
            >
              <div>
                <p className="font-semibold text-blue-800">
                  Scout: {obj.nombreScout || "(sin nombre)"}
                </p>
                <p className="font-medium mt-1">{obj.descripcion}</p>
                <p className="text-sm text-gray-600">
                  Área: {obj.areaCrecimiento} – Nivel: {obj.nivelProgresion || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Selección: {new Date(obj.fechaSeleccion).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => validarObjetivo(obj.idSeleccion)}
                disabled={cargando}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Validar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ValidarObjetivos;