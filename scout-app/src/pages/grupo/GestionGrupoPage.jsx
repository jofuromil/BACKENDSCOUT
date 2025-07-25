import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import MenuFijo from "../../components/MenuFijoGrupo";

const GestionGrupoPage = () => {
  const [dirigentes, setDirigentes] = useState([]);
  const [scouts, setScouts] = useState([]);
  const [agrupadosDirigentes, setAgrupadosDirigentes] = useState({});
  const [agrupadosScouts, setAgrupadosScouts] = useState({});
  const [usuariosRegistrados, setUsuariosRegistrados] = useState([]);
  const [usuariosEnviados, setUsuariosEnviados] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const usuarioId = localStorage.getItem("usuarioId");

  const gestion = "2025";

  useEffect(() => {
    if (!token) return navigate("/login");
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [resDirigentes, resScouts, resRegistrados] = await Promise.all([
          axios.get(`/api/gruposcout/dirigentes`, config),
          axios.get(`/api/gruposcout/ver-scouts/${usuarioId}`, config),
          axios.get(`/api/registrogestion/registrados`, config)
        ]);
        console.log("DIRIGENTES:", resDirigentes.data);
        console.log("👉 REGISTRADOS:", resRegistrados.data);

        setDirigentes(resDirigentes.data);
        setScouts(resScouts.data);
        console.log("🟠 SCOUTS:", resScouts.data.map(s => ({ nombre: s.nombreCompleto, id: s.id })));

        const registrados = resRegistrados.data.map((r) => r.usuarioId?.toLowerCase());
        const enviados = resRegistrados.data
          .filter((r) => r.enviadoADistrito)
          .map((r) => r.usuarioId);

        setUsuariosRegistrados(registrados);
        setUsuariosEnviados(enviados);

        const dPorUnidad = {};
        resDirigentes.data.forEach((d) => {
          const unidad = d.unidadNombre || "Sin unidad";
          if (!dPorUnidad[unidad]) dPorUnidad[unidad] = [];
          dPorUnidad[unidad].push(d);
        });
        setAgrupadosDirigentes(dPorUnidad);

        const sPorUnidad = {};
        resScouts.data.forEach((s) => {
          const unidad = s.unidadNombre || "Sin unidad";
          if (!sPorUnidad[unidad]) sPorUnidad[unidad] = [];
          sPorUnidad[unidad].push(s);
        });
        setAgrupadosScouts(sPorUnidad);
      } catch (error) {
        console.error("Error al cargar miembros del grupo:", error);
      }
    };

    fetchData();
  }, [token, usuarioId, navigate]);

  const estaRegistrado = (id) => usuariosRegistrados.includes(id.toLowerCase());
  const estaEnviado = (id) => usuariosEnviados.includes(id);
  const tieneDatosCompletos = (usuario) => {
    return (
      usuario.ci &&
      usuario.fechaNacimiento &&
      usuario.genero &&
      usuario.rama &&
      usuario.unidadNombre &&
      usuario.grupoScoutNombre
    );
  };

  const toggleRegistro = async (usuarioId, registrado) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      if (registrado) {
        await axios.delete(`/api/registrogestion/quitar/${usuarioId}`, config);
        setUsuariosRegistrados((prev) => prev.filter((id) => id !== usuarioId));
        setUsuariosEnviados((prev) => prev.filter((id) => id !== usuarioId));
      } else {
        await axios.post(`/api/registrogestion/registrar/${usuarioId}`, {}, config);
        setUsuariosRegistrados((prev) => [...prev, usuarioId]);
      }
    } catch (error) {
      alert("Error al cambiar registro: " + error.response?.data || error.message);
    }
  };

  const enviarADistrito = async (usuarioId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      await axios.put(`/api/registrogestion/${gestion}/enviar-distrito/${usuarioId}`, {}, config);
      setUsuariosEnviados((prev) => [...prev, usuarioId]);
    } catch (error) {
      alert("Error al enviar al distrito: " + error.response?.data || error.message);
    }
  };

  const renderTabla = (usuarios) => (
    <>
      <th className="border px-2 py-1">Registrado</th>
      <th className="border px-2 py-1">Acción</th>
      <th className="border px-2 py-1">Enviado</th>
    </>
  );

  const renderFila = (u) => (
    <>
      <td className="border px-2 py-1">{estaRegistrado(u.id) ? "Sí" : "No"}</td>
      <td className="border px-2 py-1">
        {estaRegistrado(u.id) ? (
          <button
            className="text-blue-600 underline mr-2"
            onClick={() => toggleRegistro(u.id, true)}
          >
            Quitar
          </button>
        ) : tieneDatosCompletos(u) ? (
          <button
            className="text-blue-600 underline mr-2"
            onClick={() => toggleRegistro(u.id, false)}
          >
            Registrar
          </button>
        ) : (
          <span className="text-gray-400 cursor-not-allowed">Registrar</span>
        )}
      </td>
      <td className="border px-2 py-1">
        {estaRegistrado(u.id) && !estaEnviado(u.id) ? (
          <button
            className="text-green-600 underline"
            onClick={() => enviarADistrito(u.id)}
          >
            Enviar
          </button>
        ) : estaEnviado(u.id) ? (
          "✓"
        ) : (
          "-"
        )}
      </td>
    </>
  );

  return (
    <div className="p-4 mt-20">
      <MenuFijo />
      <h2 className="text-2xl font-bold mb-6">Gestión del Grupo Scout</h2>

      <h3 className="text-xl font-semibold mt-8 mb-2">Dirigentes por Unidad</h3>
      {Object.keys(agrupadosDirigentes).map((unidad) => (
        <div key={unidad} className="mb-6">
          <h4 className="font-bold text-lg mb-2">{unidad}</h4>
          <div className="overflow-x-auto">
            <table className="table-auto border w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">CI</th>
                  <th className="border px-2 py-1">Nombre</th>
                  <th className="border px-2 py-1">Fecha Nac.</th>
                  <th className="border px-2 py-1">Género</th>
                  <th className="border px-2 py-1">Grupo Scout</th>
                  <th className="border px-2 py-1">Rama</th>
                  <th className="border px-2 py-1">Unidad</th>
                  <th className="border px-2 py-1">Profesión</th>
                  <th className="border px-2 py-1">Ocupación</th>
                  {renderTabla()}
                </tr>
              </thead>
              <tbody>
                {agrupadosDirigentes[unidad].map((d) => (
                  <tr key={d.id}>
                    <td className="border px-2 py-1">{d.ci || "-"}</td>
                    <td className="border px-2 py-1">{d.nombreCompleto}</td>
                    <td className="border px-2 py-1">{d.fechaNacimiento?.split("T")[0]}</td>
                    <td className="border px-2 py-1">{d.genero || "-"}</td>
                    <td className="border px-2 py-1">{d.grupoScoutNombre || "-"}</td>
                    <td className="border px-2 py-1">{d.rama}</td>
                    <td className="border px-2 py-1">{d.unidadNombre}</td>
                    <td className="border px-2 py-1">{d.profesion || "-"}</td>
                    <td className="border px-2 py-1">{d.ocupacion || "-"}</td>
                    {renderFila(d)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <h3 className="text-xl font-semibold mt-10 mb-2">Scouts por Unidad</h3>
      {Object.keys(agrupadosScouts).map((unidad) => (
        <div key={unidad} className="mb-6">
          <h4 className="font-bold text-lg mb-2">{unidad}</h4>
          <div className="overflow-x-auto">
            <table className="table-auto border w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">CI</th>
                  <th className="border px-2 py-1">Nombre</th>
                  <th className="border px-2 py-1">Fecha Nac.</th>
                  <th className="border px-2 py-1">Género</th>
                  <th className="border px-2 py-1">Grupo Scout</th>
                  <th className="border px-2 py-1">Rama</th>
                  <th className="border px-2 py-1">Unidad</th>
                  <th className="border px-2 py-1">Colegio</th>
                  <th className="border px-2 py-1">Curso</th>
                  {renderTabla()}
                </tr>
              </thead>
              <tbody>
                {agrupadosScouts[unidad].map((s) => (
                  <tr key={s.id}>
                    <td className="border px-2 py-1">{s.ci || "-"}</td>
                    <td className="border px-2 py-1">{s.nombreCompleto}</td>
                    <td className="border px-2 py-1">{s.fechaNacimiento?.split("T")[0]}</td>
                    <td className="border px-2 py-1">{s.genero}</td>
                    <td className="border px-2 py-1">{s.grupoScoutNombre || "-"}</td>
                    <td className="border px-2 py-1">{s.rama}</td>
                    <td className="border px-2 py-1">{s.unidadNombre}</td>
                    <td className="border px-2 py-1">{s.institucionEducativa || "-"}</td>
                    <td className="border px-2 py-1">{s.nivelEstudios || "-"}</td>
                    {renderFila(s)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="mt-10">
        <Link to="/grupo" className="text-blue-600 underline">
          ← Volver al Panel del Grupo
        </Link>
      </div>
    </div>
  );
};

export default GestionGrupoPage;
