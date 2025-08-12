import { useEffect, useState } from "react";
import MenuFijo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

export default function MisEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8080/api/Especialidades/mis-avances", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Avances:", data);
        setEspecialidades(data);
      })
      .catch((err) => console.error("Error al cargar especialidades", err));
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
    <div className="min-h-screen pb-20">
      {/* Menú fijo superior para pantallas grandes */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-4xl mx-auto pt-6 px-4">
        <h1 className="text-3xl font-bold text-yellow-600 mb-6 flex items-center">
          <span className="mr-2">⭐</span> Mis Especialidades
        </h1>

        {especialidades.length === 0 ? (
          <p className="text-gray-600">No tienes especialidades registradas.</p>
        ) : (
          <div className="space-y-4">
            {especialidades.map((avance) => (
              <div
                key={avance.especialidadId}
                className="border rounded p-4 shadow bg-white flex items-center"
              >
                {/* Imagen desde URL completa */}
                <img
                  src={avance.imagenUrl}
                  alt={avance.nombre}
                  className="w-12 h-12 object-cover rounded-full mr-4"
                />

                <div className="flex-1">
                  <h2 className="text-lg font-bold">{avance.nombre}</h2>
                  <p className="text-sm text-gray-600">
                    Requisitos seleccionados: {avance.seleccionados} / Aprobados: {avance.aprobados}
                  </p>

                  <p className="text-sm mt-1">
                    {avance.cumplida ? (
                      <span className="text-green-600 font-semibold">✅ Cumplida</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">🟡 En progreso</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
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

