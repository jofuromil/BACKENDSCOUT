// src/pages/PanelDirigente.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuFijo from "../components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

function PanelDirigente() {
  const [codigoUnidad, setCodigoUnidad] = useState("");
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [ramaUnidad, setRamaUnidad] = useState("");
  const [nombreDirigente, setNombreDirigente] = useState("");
  const [grupoScout, setGrupoScout] = useState("");
  const [esAdminGrupoScout, setEsAdminGrupoScout] = useState(false);
  const [unidadInfoVisible, setUnidadInfoVisible] = useState(false);
  const [tieneRolDistrito, setTieneRolDistrito] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const cargarDatos = async () => {
      try {
        // 1) Datos del usuario
        const resUser = await axios.get("http://localhost:8080/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = resUser.data;
        setNombreDirigente(user.nombreCompleto);
        setEsAdminGrupoScout(user.esAdminGrupoScout || false);

        if (user?.unidad?.codigoUnidad) {
          setCodigoUnidad(user.unidad.codigoUnidad);
          setNombreUnidad(user.unidad.nombre);
          setRamaUnidad(user.unidad.rama);
          setGrupoScout(user.unidad.grupoScout);
          setUnidadInfoVisible(true);
          localStorage.setItem("unidadId", user.unidad.id);
          localStorage.setItem("codigoUnidad", user.unidad.codigoUnidad);
        }

        // 2) Verificar rol a nivel distrito (fiable: desde backend)
        if (user?.id) {
          try {
            const resDistrito = await axios.get(
              `http://localhost:8080/api/DistritoUsuario/distritos/${user.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            // Si tiene al menos un registro distrital, mostramos el botón
            setTieneRolDistrito(Array.isArray(resDistrito.data) && resDistrito.data.length > 0);
          } catch {
            setTieneRolDistrito(false);
          }
        } else {
          setTieneRolDistrito(false);
        }
      } catch (err) {
        alert("Error al cargar los datos del dirigente.");
        navigate("/login");
      }
    };

    cargarDatos();
  }, [navigate]);

  const irAGrupoScout = () => {
    if (esAdminGrupoScout) {
      navigate("/grupo");
    } else {
      alert("No eres administrador del grupo scout.");
    }
  };

  return (
    <div
      className="min-h-screen bg-white text-gray-800 flex flex-col pb-24 pt-20"
      style={{
        backgroundImage: `url(${fondoScout})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
      }}
    >
      <div className="min-h-screen pb-20 flex flex-col">
        <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
          <MenuFijo />
        </div>

        <div className="max-w-2xl mx-auto p-6 pt-6">
          <h1 className="text-3xl font-bold mb-6">🎖️ Panel del Dirigente</h1>

          {unidadInfoVisible && (
            <div className="bg-purple-100 p-4 rounded-xl mb-6">
              <p>
                <strong>Dirigente:</strong> {nombreDirigente}
              </p>
              <p>
                <strong>Nombre de la unidad:</strong> {nombreUnidad}
              </p>
              <p>
                <strong>Grupo Scout:</strong> {grupoScout}
              </p>
              <p>
                <strong>Rama:</strong> {ramaUnidad}
              </p>
              <p>
                <strong>Código de la unidad:</strong> {codigoUnidad}
              </p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Unidad Scout</h2>
            <button
              onClick={() => navigate("/miembros-unidad")}
              className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full mb-2"
            >
              Administrar Unidad
            </button>
            <button
              onClick={() => navigate("/dirigente/scouts-unidad")}
              className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full"
            >
              Scouts de la Unidad
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Objetivos Educativos</h2>
            <button
              onClick={() => navigate("/dirigente/validar-objetivos")}
              className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full"
            >
              Validar Objetivos de Scouts
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Especialidades</h2>
            <button
              onClick={() => navigate("/dirigente/especialidades")}
              className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full mb-2"
            >
              Ver especialidades para aprobar
            </button>
            <button
              onClick={() => navigate("/dirigente/especialidades/resumen")}
              className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full"
            >
              Ver especialidades de scouts
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Eventos</h2>
            <button
              onClick={() => navigate("/dirigente/eventos")}
              className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full"
            >
              📋 Gestionar eventos de mi unidad
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Comunicación</h2>
            <button
              onClick={() => navigate("/mensajes-unidad")}
              className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full mb-2"
            >
              Mensajes a la Unidad
            </button>
            <button
              onClick={() => navigate("/ver-mensajes-unidad")}
              className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full mb-2"
            >
              Ver Mensajes de la Unidad
            </button>
            <button
              onClick={() => navigate("/scout/ver-mensajesA")}
              className="border-2 border-blue-600 text-blue-700 px-4 py-2 rounded-full w-full"
            >
              Ver Mensajes del Grupo
            </button>
          </div>

          {/* Niveles Superiores */}
          {(esAdminGrupoScout || tieneRolDistrito) && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Niveles Superiores</h2>

              {esAdminGrupoScout && (
                <button
                  onClick={irAGrupoScout}
                  className="border-2 border-blue-600 text-blue-700 px-4 py-2 rounded-full w-full mb-2"
                >
                  Ir al Grupo Scout
                </button>
              )}

              {/* AHORA SÍ: solo visible si TIENE rol de distrito */}
              {tieneRolDistrito && (
                <button
                  onClick={() => navigate("/distrito")}
                  className="border-2 border-indigo-600 text-indigo-700 px-4 py-2 rounded-full w-full"
                >
                  Ir al Panel de Distrito
                </button>
              )}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-2">Cuenta</h2>
            <button
              onClick={() => navigate("/perfil")}
              className="border-2 border-gray-600 text-gray-700 px-4 py-2 rounded-full w-full mb-2"
            >
              Ver / Editar Perfil
            </button>
            <button
              onClick={() => navigate("/")}
              className="border-2 border-red-600 text-red-700 px-4 py-2 rounded-full w-full"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <MenuFijo />
        </div>
      </div>
    </div>
  );
}

export default PanelDirigente;
