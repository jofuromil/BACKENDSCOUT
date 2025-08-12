import { useEffect, useState } from "react";
import axios from "axios";
import ValidarObjetivos from "../components/dirigente/ValidarObjetivos";
import MenuFijo from "../components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

export default function ValidarObjetivosDirigente() {
  const [codigoUnidad, setCodigoUnidad] = useState("");
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [ramaUnidad, setRamaUnidad] = useState("");
  const [nombreDirigente, setNombreDirigente] = useState("");
  const [unidadInfoVisible, setUnidadInfoVisible] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    axios
      .get("http://localhost:8080/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const user = res.data;
        setNombreDirigente(user.nombreCompleto);
        if (user?.unidad?.codigoUnidad) {
          setCodigoUnidad(user.unidad.codigoUnidad);
          setNombreUnidad(user.unidad.nombre);
          setRamaUnidad(user.unidad.rama);
          setUnidadInfoVisible(true);
          localStorage.setItem("unidadId", user.unidad.id);
          localStorage.setItem("codigoUnidad", user.unidad.codigoUnidad);
        }
      })
      .catch(() => {
        alert("Error al cargar los datos del dirigente.");
        window.location.href = "/login";
      });
  }, [token]);

  return (
    <div
          className="min-h-screen bg-white text-gray-800 flex flex-col pb-24 pt-20"
          style={{
            backgroundImage: `url(${fondoScout})`,
            backgroundRepeat: "repeat",
            backgroundSize: "contain"
          }}
        >
    <div className="min-h-screen pb-20 flex flex-col">
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-2xl mx-auto p-6 pt-6">
        <h1 className="text-3xl font-bold mb-6">🎯 Validar Objetivos</h1>

        {unidadInfoVisible && (
          <div className="bg-blue-100 p-4 rounded mb-6">
            <p><strong>Dirigente:</strong> {nombreDirigente}</p>
            <p><strong>Unidad:</strong> {nombreUnidad}</p>
            <p><strong>Rama:</strong> {ramaUnidad}</p>
            <p><strong>Código de unidad:</strong> {codigoUnidad}</p>
          </div>
        )}

        <ValidarObjetivos />
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
    </div>
  );
}
