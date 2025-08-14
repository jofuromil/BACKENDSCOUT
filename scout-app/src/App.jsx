import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio"; // 👈 este es el correcto
import Registro from "./pages/Registro";
import PanelScout from "./pages/PanelScout";
import PanelDirigente from "./pages/PanelDirigente";
import Unidad from "./pages/Unidad";
import Objetivos from "./pages/Objetivos"; // asegúrate que la ruta sea correcta
import ObjetivosNivel from "./pages/ObjetivosNivel";
import ObjetivosScoutPanel from "./pages/ObjetivosScoutPanel";
import MiembrosUnidad from "./pages/MiembrosUnidad";
import EnviarMensajeUnidad from "./pages/EnviarMensajeUnidad";
import VerMensajesUnidad from "./components/dirigente/VerMensajesUnidad";
import MensajesRecibidosScout from "./pages/MensajesRecibidosScout";
import PaginaEventosDirigente from "./pages/dirigente/eventos";
import PaginaCrearEvento from "./pages/dirigente/crear-evento";
import EventosScout from "./pages/scout/EventosScout";
import RegistrarAvanceEspecialidad from "./pages/scout/RegistrarAvanceEspecialidad";
import VerEspecialidadDetalle from "./pages/scout/VerEspecialidadDetalle";
import MisEspecialidades from "./pages/scout/MisEspecialidades";
import EspecialidadesDirigentePanel from "./pages/dirigente/EspecialidadesDirigentePanel";
import ValidarEspecialidadScout from "./pages/dirigente/ValidarEspecialidadScout";
import EventoDetalleDirigente from "./pages/dirigente/EventoDetalleDirigente";
import PerfilUsuario from "./pages/PerfilUsuario";
import RestablecerConCodigo from "./pages/RestablecerConCodigo";
import ResumenEspecialidadesDirigente from "./pages/dirigente/ResumenEspecialidadesDirigente";
import MiembrosScoutsUnidad from "./pages/MiembrosScoutsUnidad";
import NotFound from "./pages/NotFound";
import ValidarObjetivosDirigente from "./pages/ValidarObjetivosDirigente"; // Asegúrate de tener esta línea en la parte superior
import KardexScout from "./pages/KardexScout";
import KardexScoutDirigente from "./pages/KardexScoutDirigente";
import PanelGrupoScout from "./pages/grupo/PanelGrupoScout";
import VerScoutsGrupo from "./pages/grupo/VerScoutsGrupo";
import VerDirigentesGrupo from "./pages/grupo/VerDirigentesGrupo";
import VerUnidadesGrupo from "./pages/grupo/VerUnidadesGrupo";
import CrearEventoGrupo from "./pages/grupo/CrearEventoGrupo";
import ListaEventosGrupo from "./pages/grupo/ListaEventosGrupo";
import EnviarMensajesGrupo from "./pages/grupo/EnviarMensajesGrupo";
import VerMensajesGrupo from "./pages/grupo/VerMensajesGrupo";
import VerMensajesGrupoA from "./pages/scout/VerMensajesGrupoA";
import VerPerfilScoutDirigente from "./pages/dirigente/VerPerfilScoutDirigente";
import GestionGrupoPage from './pages/grupo/GestionGrupoPage';
import EnviarMensajeGrupo from "./pages/grupo/EnviarMensajeGrupo";
import PanelDistrito from "./pages/distrito/PanelDistrito";
import RegistrosDistrito from "./pages/distrito/RegistrosDistrito";
import RegistrosGrupoDistrito from "./pages/distrito/RegistrosGrupoDistrito";
import ResumenRegistrosDistrito from "./pages/distrito/ResumenRegistrosDistrito";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/unidad" element={<Unidad />} />
        <Route path="/panel-scout" element={<PanelScout />} />
        <Route path="/panel-dirigente" element={<PanelDirigente />} />
        <Route path="/objetivos" element={<Objetivos />} />
        <Route path="/objetivos-nivel" element={<ObjetivosNivel />} />
        <Route path="/scout/objetivos" element={<ObjetivosScoutPanel />} />
        <Route path="/miembros-unidad" element={<MiembrosUnidad />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/mensajes-unidad" element={<EnviarMensajeUnidad />} />
        <Route path="/ver-mensajes-unidad" element={<VerMensajesUnidad />} />
        <Route path="/mensajes-recibidos" element={<MensajesRecibidosScout />} />
        <Route path="/dirigente/crear-evento" element={<PaginaCrearEvento />} />
        <Route path="/dirigente/eventos" element={<PaginaEventosDirigente />} />
        <Route path="/scout/eventos" element={<EventosScout />} />
        <Route path="/registrar-avance-especialidades" element={<RegistrarAvanceEspecialidad />} />
        <Route path="/especialidades/:id" element={<VerEspecialidadDetalle />} />
        <Route path="/mis-especialidades" element={<MisEspecialidades />} />
        <Route path="/dirigente/especialidades" element={<EspecialidadesDirigentePanel />} />
        <Route path="/dirigente/especialidades/:scoutId" element={<ValidarEspecialidadScout />} />
        <Route path="/dirigente/evento-detalle/:eventoId" element={<EventoDetalleDirigente />} />
        <Route path="/restablecer" element={<RestablecerConCodigo />} />
        <Route path="/dirigente/especialidades/resumen" element={<ResumenEspecialidadesDirigente />} />
        <Route path="/dirigente/objetivos-scout/:scoutId" element={<ObjetivosScoutPanel />} />
        <Route path="/dirigente/scouts-unidad" element={<MiembrosScoutsUnidad />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
        <Route path="/dirigente/validar-objetivos" element={<ValidarObjetivosDirigente />} />
        <Route path="/kardex" element={<KardexScout />} /> 
        <Route path="/kardex-scout/:scoutId" element={<KardexScout />} />  
        <Route path="/dirigente/kardex/:scoutId" element={<KardexScoutDirigente />} />
        <Route path="/dirigente/perfil-scout/:scoutId" element={<VerPerfilScoutDirigente />} />
        <Route path="/grupo" element={<PanelGrupoScout />} />
        <Route path="/grupo/scouts" element={<VerScoutsGrupo />} />
        <Route path="/grupo/dirigentes" element={<VerDirigentesGrupo />} />
        <Route path="/grupo/unidades" element={<VerUnidadesGrupo />} />
        <Route path="/grupo/eventos/nuevo" element={<CrearEventoGrupo />} />
        <Route path="/grupo/eventos" element={<ListaEventosGrupo />} />
        <Route path="/grupo/mensajes" element={<EnviarMensajesGrupo />} />
        <Route path="/grupo/ver-mensajes" element={<VerMensajesGrupo />} />
        <Route path="/scout/ver-mensajesA" element={<VerMensajesGrupoA />} />
        <Route path="/grupo/gestion" element={<GestionGrupoPage />} />
        <Route path="/grupo/enviar-mensaje" element={<EnviarMensajeGrupo />} />
        <Route path="/distrito" element={<PanelDistrito />} />
        <Route path="/distrito/registros" element={<RegistrosDistrito />} />
        <Route path="/distrito/registros/:grupoId" element={<RegistrosGrupoDistrito />} />
        <Route path="/distrito/resumen-registros" element={<ResumenRegistrosDistrito />} />
      </Routes>
    </Router>
  );
}

export default App;
