import { useEffect, useState } from 'react';
import {
  registrar,
  iniciarSesion,
  obtenerSolicitudes,
  decidirAcceso,
  obtenerProductos,
  crearPedido,
} from './services/api';
import './App.css';

const dinero = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

function App() {
  const [modo, setModo] = useState('login');
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    password: '',
  });
  const [sesion, setSesion] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [roles, setRoles] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [comprandoId, setComprandoId] = useState(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [dbOk, setDbOk] = useState(true);

  useEffect(() => {
    const verificarDB = async () => {
      try {
        const respuesta = await fetch('/api/salud-db');
        if (!respuesta.ok) {
          if (dbOk) setDbOk(false);
        } else {
          if (!dbOk) setDbOk(true);
        }
      } catch (error) {
        if (dbOk) setDbOk(false);
      }
    };

    verificarDB();
    const intervalo = setInterval(verificarDB, 5000);
    return () => clearInterval(intervalo);
  }, [dbOk]);

  useEffect(() => {
    if (!sesion) return;

    async function cargarPanel() {
      try {
        if (sesion.usuario.rol === 'super_admin') {
          const datos = await obtenerSolicitudes(sesion.token);
          setSolicitudes(datos.solicitudes);
        } else if (sesion.usuario.rol === 'pedidos') {
          const datos = await obtenerProductos(sesion.token);
          setProductos(datos.productos);
        }
      } catch (error) {
        setMensaje(error.message);
      }
    }

    cargarPanel();
  }, [sesion]);

  function cambiarCampo(evento) {
    setFormulario({
      ...formulario,
      [evento.target.name]: evento.target.value,
    });
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();
    setMensaje('');
    setCargando(true);

    try {
      if (modo === 'registro') {
        await registrar(formulario);
        setFormulario({ nombre: '', email: '', password: '' });
        setModo('login');
        setMensaje('Registro recibido. Espera a que el súper admin apruebe tu acceso.');
      } else {
        const datos = await iniciarSesion({
          email: formulario.email,
          password: formulario.password,
        });
        setFormulario({ nombre: '', email: '', password: '' });
        setSesion(datos);
      }
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  async function resolver(id, decision) {
    setMensaje('');

    try {
      const rol = roles[id] || 'pedidos';
      const datos = await decidirAcceso(sesion.token, id, decision, rol);
      setSolicitudes((actuales) =>
        actuales.filter((solicitud) => solicitud.id !== id)
      );
      setMensaje(
        `${datos.usuario.nombre}: acceso ${datos.usuario.estado}` +
        (datos.usuario.rol ? ` como ${datos.usuario.rol}` : '')
      );
    } catch (error) {
      setMensaje(error.message);
    }
  }
  async function comprarProducto(producto) {
    if (comprandoId !== null) return;

    setMensaje('');
    setPedidoConfirmado(null);
    setComprandoId(producto.id);

    try {
      const resultado = await crearPedido(sesion.token, producto.id, 1);
      setPedidoConfirmado({
        id: resultado.pedidoId,
        producto: producto.nombre,
        total: resultado.total,
        estado: resultado.estado,
      });
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setComprandoId(null);
    }
  }

  function salir() {
    setSesion(null);
    setSolicitudes([]);
    setProductos([]);
    setMensaje('');
    setModo('login');
    setPedidoConfirmado(null);
    setComprandoId(null);
  }

  return (
    <div className="app">
      {!dbOk && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <h1 style={{ color: '#ff4d4f' }}>Servicio no disponible</h1>
          <p>La base de datos se encuentra inactiva o inalcanzable. Por favor, espera a que se restablezca la conexión.</p>
        </div>
      )}
      <header className="encabezado">
        <div className="marca">NOVA<span>TECH</span></div>
        {sesion && <button className="salir" onClick={salir}>Cerrar sesión</button>}
      </header>

      {!sesion ? (
        <main className="acceso">
          <section className="presentacion">
            <span className="etiqueta">Marketplace de laptops</span>
            <h1>Tu próxima laptop está aquí.</h1>
            <p>Explora equipos para estudiar, trabajar o jugar. El acceso a cada módulo es autorizado por el súper admin.</p>
          </section>

          <section className="tarjeta formulario">
            <div className="pestanas">
              <button className={modo === 'login' ? 'activa' : ''} onClick={() => { setModo('login'); setMensaje(''); }}>Iniciar sesión</button>
              <button className={modo === 'registro' ? 'activa' : ''} onClick={() => { setModo('registro'); setMensaje(''); }}>Registrarse</button>
            </div>

            <h2>{modo === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
            <p className="texto-suave">{modo === 'login' ? 'Ingresa tus credenciales para continuar.' : 'Tu solicitud será revisada por el súper admin.'}</p>

            <form onSubmit={enviarFormulario}>
              {modo === 'registro' && (
                <label>Nombre
                  <input name="nombre" value={formulario.nombre} onChange={cambiarCampo} required />
                </label>
              )}
              <label>Correo electrónico
                <input type="email" name="email" value={formulario.email} onChange={cambiarCampo} required />
              </label>
              <label>Contraseña
                <input type="password" name="password" value={formulario.password} onChange={cambiarCampo} minLength={8} required />
              </label>
              <button className="principal" disabled={cargando}>
                {cargando ? 'Espera...' : modo === 'login' ? 'Entrar' : 'Enviar solicitud'}
              </button>
            </form>
            {mensaje && <p className="aviso">{mensaje}</p>}
          </section>
        </main>
      ) : (
        <main className="contenido">
          <div className="titulo-panel">
            <div>
              <span className="etiqueta">Panel {sesion.usuario.rol}</span>
              <h1>Hola, {sesion.usuario.nombre}</h1>
            </div>
            <p>{sesion.usuario.email}</p>
          </div>

          {sesion.usuario.rol === 'super_admin' && (
            <section>
              <h2>Solicitudes de acceso</h2>
              <p className="texto-suave">Aprueba o rechaza las cuentas nuevas y asigna su rol.</p>
              {solicitudes.length === 0 ? (
                <div className="tarjeta vacio">No hay solicitudes pendientes.</div>
              ) : solicitudes.map((usuario) => (
                <div className="tarjeta solicitud" key={usuario.id}>
                  <div>
                    <strong>{usuario.nombre}</strong>
                    <p>{usuario.email}</p>
                    <span className="estado">Pendiente</span>
                  </div>
                  <div className="acciones">
                    <select
                      value={roles[usuario.id] || 'pedidos'}
                      onChange={(evento) => setRoles({
                        ...roles, [usuario.id]: evento.target.value,
                      })}
                    >
                      <option value="pedidos">Pedidos</option>
                      <option value="productos">Productos</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="principal" onClick={() => resolver(usuario.id, 'aprobar')}>Aprobar</button>
                    <button className="secundario" onClick={() => resolver(usuario.id, 'rechazar')}>Rechazar</button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {sesion.usuario.rol === 'pedidos' && (
            <section>
              <h2>Productos disponibles</h2>
              <p className="texto-suave">Consulta las laptops aprobadas con sus características y precios.</p>

              {pedidoConfirmado && (
                <div className="tarjeta confirmacion-pedido" role="status">
                  <h3>¡Pedido registrado correctamente!</h3>
                  <p><strong>Número de pedido:</strong> #{pedidoConfirmado.id}</p>
                  <p><strong>Producto:</strong> {pedidoConfirmado.producto}</p>
                  <p><strong>Total:</strong> {dinero.format(Number(pedidoConfirmado.total))}</p>
                  <p><strong>Estado:</strong> Pendiente de pago</p>
                  <p>Revisa tu confirmación con las instrucciones de pago.</p>
                </div>
              )}
              <div className="cuadricula">
                {productos.map((producto) => (
                  <article className="tarjeta producto" key={producto.id}>
                    <img src={producto.imagen_url} alt={producto.nombre} />
                    <div className="detalle">
                      <span className="estado">Disponible</span>
                      <h3>{producto.nombre}</h3>
                      <p>{producto.descripcion}</p>
                      <strong>{dinero.format(Number(producto.precio))}</strong>
                      <button
                        className="principal"
                        type="button"
                        disabled={comprandoId !== null}
                        onClick={() => comprarProducto(producto)}
                      >
                        {comprandoId === producto.id ? 'Procesando compra...' : 'Comprar'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {!['super_admin', 'pedidos'].includes(sesion.usuario.rol) && (
            <div className="tarjeta vacio">Tu panel de {sesion.usuario.rol} se agregará en la siguiente etapa.</div>
          )}

          {mensaje && <p className="aviso">{mensaje}</p>}
        </main>
      )}
    </div>
  );
}

export default App;
