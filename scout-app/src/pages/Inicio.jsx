import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogIn } from "lucide-react";

function Inicio() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const res = await axios.post("http://localhost:8080/api/users/login", {
        correo,
        password: clave,
      });

      const data = res.data;
      console.log("DATA COMPLETA:", data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioId", data.user.id);
      localStorage.setItem("tipo", data.user.tipo);
      localStorage.setItem("rama", data.user.rama || "");
      localStorage.setItem("unidadId", data.user.unidadId || "");

      // ✅ Nuevo: llamar a /me para obtener la unidad completa
      const meResponse = await axios.get("http://localhost:8080/api/users/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const usuario = meResponse.data;
      console.log("✅ DATA.ME:", usuario);
      console.log("✅ DATA.ME.UNIDAD:", usuario.unidad);

      if (usuario.unidad?.grupoId) {
        localStorage.setItem("grupoId", usuario.unidad.grupoId);
        localStorage.setItem("grupoScout", usuario.unidad.grupoScout);
        localStorage.setItem("distrito", usuario.unidad.distrito);
      }

      if (!data.user.unidadId) {
        navigate("/unidad");
      } else if (data.user.tipo.toLowerCase() === "dirigente") {
        navigate("/panel-dirigente");
      } else {
        navigate("/panel-scout");
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || "❌ Error de autenticación.";
      setMensaje(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-purple-600 text-white px-6 py-10">
      <img
        src="/logo-scout-color.png"
        alt="Logo Scout"
        className="w-40 h-40 mb-6"
      />

      <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
      <p className="text-lg mb-8">Inicia sesión para ingresar al sistema</p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          className="p-3 rounded-lg bg-white text-black placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
          className="p-3 rounded-lg bg-white text-black placeholder-gray-500"
        />

        <button
          type="submit"
          className="flex items-center justify-center gap-2 border-2 border-white text-white py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-purple-700 transition"
        >
          <LogIn className="w-6 h-6" />
          Ingresar
        </button>

        <div className="text-center">
          <a href="/restablecer" className="text-sm text-white hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {mensaje && (
          <div className="text-red-200 mt-2 text-center text-sm">{mensaje}</div>
        )}
      </form>

      <p className="mt-8 text-sm">
        ¿Eres nuevo?{" "}
        <a
          href="/registro"
          className="underline font-semibold hover:text-purple-200"
        >
          Crea una cuenta
        </a>
      </p>
    </div>
  );
}

export default Inicio;
