"use client";
// ------------------------------------------------------------------
// DIRECTIVA DE NEXT.JS
// ------------------------------------------------------------------
// "use client" es obligatorio porque este componente utiliza hooks
// (useState, FormEvent, ChangeEvent) y eventos interactivos que solo
// pueden ejecutarse en el navegador, no en el servidor.

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
// Link: Componente de Next.js para navegación interna sin recargar la página.

// ------------------------------------------------------------------
// DEFINICIÓN DE TIPOS (TypeScript)
// ------------------------------------------------------------------
/**
 * Interfaz que define la estructura de los datos del formulario de contacto.
 * Se utiliza para tipar el estado 'contacto' y garantizar que los valores
 * de los inputs coinciden con lo esperado por la aplicación.
 */
interface Contacto {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

/**
 * Interfaz para los mensajes de error de validación por campo.
 * Cada propiedad es opcional (?) porque solo se define cuando hay un error.
 */
interface ContactoError {
  nombre?: string;
  email?: string;
  asunto?: string;
  mensaje?: string;
}

/**
 * Interfaz para la respuesta que esperamos recibir del servicio de envío.
 */
interface ContactoResponse {
  success: boolean;
  message: string;
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPAL: Página de Contacto
// ------------------------------------------------------------------
export default function ContactoPage() {
  // [SECCIÓN 1] ESTADOS DEL FORMULARIO
  // 'contacto': Almacena los valores que el usuario escribe en cada input.
  const [contacto, setContacto] = useState<Contacto>({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });

  // 'errors': Guarda los mensajes de error de validación para mostrar bajo cada campo.
  const [errors, setErrors] = useState<ContactoError>({});

  // [SECCIÓN 2] ESTADOS DE CONTROL DE UI
  // 'enviando': Desactiva el botón mientras se procesa el envío para evitar clics múltiples.
  // 'feedback': Mensaje de éxito o error que se muestra al usuario tras enviar el formulario.
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<ContactoResponse | null>(null);

  // ------------------------------------------------------------------
  // [FUNCIÓN] Manejar cambios en los inputs
  // ------------------------------------------------------------------
  /**
   * Se ejecuta cada vez que el usuario escribe en un campo del formulario.
   * Actualiza el estado 'contacto' y limpia el error de ese campo si existía.
   */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Actualizar solo el campo que cambió, manteniendo los demás intactos
    setContacto((prev) => ({ ...prev, [name]: value }));

    // Si había un error en este campo, lo eliminamos al empezar a escribir de nuevo
    if (errors[name as keyof ContactoError]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ------------------------------------------------------------------
  // [FUNCIÓN] Validar formulario antes de enviar
  // ------------------------------------------------------------------
  /**
   * Verifica que todos los campos obligatorios tengan valores válidos.
   * Devuelve true si todo está correcto, false si hay errores de validación.
   */
  const validarFormulario = (): boolean => {
    const newErrors: ContactoError = {};

    // Validar nombre: obligatorio y mínimo 8 caracteres
    if (!contacto.nombre.trim() || contacto.nombre.length < 8) {
      newErrors.nombre =
        "El nombre es obligatorio y debe tener al menos 8 caracteres.";
    }

    // Validar email: formato básico con expresión regular
    if (!contacto.email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.email)) {
      newErrors.email = "El email no es válido.";
    }

    // Validar asunto: obligatorio, mínimo 10 caracteres, mínimo 4 palabras
    if (!contacto.asunto.trim()) {
      newErrors.asunto = "El asunto es obligatorio.";
    } else {
      const asuntoLimpio = contacto.asunto.trim();

      // Calcular longitud en caracteres
      const longitudAsunto = asuntoLimpio.length;

      // Calcular número de palabras: dividir por espacios y filtrar vacíos
      const cantidadPalabras = asuntoLimpio
        .split(/\s+/)
        .filter((p) => p.length > 0).length;

      // Validar mínimo de caracteres
      if (longitudAsunto < 10 || cantidadPalabras < 4) {
        newErrors.asunto = `El asunto debe tener al menos 10 caracteres y al menos 4 palabras (actual: ${longitudAsunto} caracteres, ${cantidadPalabras} palabras).`;
      }
    }

    // Validar mensaje: obligatorio, mínimo 30 caracteres, máximo 2000, mínimo 5 palabras
    if (!contacto.mensaje.trim()) {
      newErrors.mensaje = "El mensaje es obligatorio.";
    } else {
      const mensajeLimpio = contacto.mensaje.trim();
      const longitud = mensajeLimpio.length;

      // Contar palabras: dividir por espacios y filtrar elementos vacíos
      const cantidadPalabras = mensajeLimpio
        .split(/\s+/)
        .filter((p) => p.length > 0).length;

      // Validar longitud mínima
      if (longitud < 30) {
        newErrors.mensaje = `El mensaje debe tener al menos 30 caracteres (actual: ${longitud}).`;
      }
      // Validar longitud máxima
      else if (longitud > 2000) {
        newErrors.mensaje = `El mensaje no puede superar los 2000 caracteres (actual: ${longitud}).`;
      }
      // Validar número mínimo de palabras
      else if (cantidadPalabras < 5) {
        newErrors.mensaje = `El mensaje debe contener al menos 5 palabras (actual: ${cantidadPalabras}).`;
      }
    }

    // Guardar errores en el estado y devolver si hay o no errores
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------------------------------------------------------
  // [FUNCIÓN] Manejar envío del formulario
  // ------------------------------------------------------------------
  /**
   * Función asíncrona que se ejecuta al pulsar "Enviar mensaje".
   * Valida los datos, envía el formulario a Formspree y muestra feedback al usuario.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Validar campos antes de continuar
    if (!validarFormulario()) {
      return;
    }

    // 2. Activar estado de envío
    setEnviando(true);
    setFeedback(null);

    try {
      // Endpoint de Formspree proporcionado
      const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzllvgn";

      // 3. Enviar datos a Formspree mediante fetch
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombre: contacto.nombre,
          email: contacto.email,
          asunto: contacto.asunto,
          mensaje: contacto.mensaje,
          // Campos especiales de Formspree para mejorar el correo recibido
          _subject: `Nuevo mensaje de contacto: ${contacto.asunto}`,
          _replyto: contacto.email,
        }),
      });

      // 4. Procesar respuesta de Formspree
      if (response.ok) {
        setFeedback({
          success: true,
          message: "Mensaje enviado correctamente. Te contactaremos pronto.",
        });
        // Limpiar formulario tras envío exitoso
        setContacto({ nombre: "", email: "", asunto: "", mensaje: "" });
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => setFeedback(null), 5000);
      } else {
        // Manejar errores específicos de Formspree
        const errorData = await response.json();
        const mensajeError = errorData.errors
          ? Object.values(errorData.errors).join(", ")
          : "Error al procesar el mensaje.";
        setFeedback({
          success: false,
          message: mensajeError,
        });
      }
    } catch (error) {
      // 5. Manejar errores de red o del servidor
      console.error("Error al enviar el formulario:", error);
      setFeedback({
        success: false,
        message: "Error de conexión. Inténtalo de nuevo más tarde.",
      });
    } finally {
      // 6. Desactivar estado de envío en cualquier caso
      setEnviando(false);
    }
  };

  // ------------------------------------------------------------------
  // [SECCIÓN 3] INTERFAZ VISUAL (JSX con Tailwind CSS)
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen p-6">
      <main className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8">
        {/* CABECERA: Título y enlace de vuelta a la página principal */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Contáctanos
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
          >
            Volver a coches
          </Link>
        </div>

        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          ¿Tienes alguna pregunta o comentario? Envíanos un mensaje.
        </p>

        {/* MENSAJE DE FEEDBACK (se muestra solo si existe) */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-lg text-center font-medium ${
              feedback.success
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* FORMULARIO DE CONTACTO */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo: Nombre */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={contacto.nombre}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                errors.nombre
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
              }`}
              placeholder="Tu nombre completo"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Campo: Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={contacto.email}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          {/* Campo: Asunto */}
          <div>
            <label
              htmlFor="asunto"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Asunto *
            </label>
            <input
              type="text"
              id="asunto"
              name="asunto"
              value={contacto.asunto}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                errors.asunto
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
              }`}
              placeholder="Motivo de tu consulta"
            />
            {errors.asunto && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.asunto}
              </p>
            )}
          </div>

          {/* Campo: Mensaje */}
          <div>
            <label
              htmlFor="mensaje"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
            >
              Mensaje *
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={contacto.mensaje}
              onChange={handleChange}
              maxLength={2000}
              rows={5}
              className={`w-full p-3 rounded-lg border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 transition resize-vertical ${
                errors.mensaje
                  ? "border-red-500 focus:ring-red-500"
                  : "border-zinc-300 dark:border-zinc-600 focus:ring-blue-500"
              }`}
              placeholder="Escribe tu mensaje aquí (mín. 30 caracteres, 5 palabras)"
            />

            {/* CONTADOR DE CARACTERES Y PALABRAS PARA MENSAJE */}
            <div className="flex justify-between items-center mt-1">
              <span
                className={`text-xs ${
                  contacto.mensaje.length > 2000 ||
                  (contacto.mensaje.trim().length > 0 &&
                    contacto.mensaje.trim().length < 30)
                    ? "text-red-600 dark:text-red-400 font-medium"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {contacto.mensaje.length}/2000 caracteres
              </span>
              <span className="text-xs text-zinc-400">
                {contacto.mensaje.trim() === ""
                  ? "0 palabras"
                  : `${
                      contacto.mensaje
                        .trim()
                        .split(/\s+/)
                        .filter((p) => p.length > 0).length
                    } palabras`}
              </span>
            </div>

            {errors.mensaje && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.mensaje}
              </p>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg transition disabled:cursor-not-allowed"
          >
            {enviando ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>

        {/* INFORMACIÓN ADICIONAL DE CONTACTO */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            También puedes contactarnos directamente en:{" "}
            <span className="font-extrabold font-xl font-sans text-zinc-600 dark:text-white">
              contacto@tienda.es
            </span>
          </p>
        </div>

        {/* MAPA DE UBICACIÓN */}
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-6">
            Nuestra Ubicación
          </h2>
          <div className="w-full h-80 rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-700">
            <iframe
              src="https://maps.google.com/maps?q=40.029889,-6.090175&hl=es&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de ubicación"
            ></iframe>
          </div>
        </div>
      </main>
    </div>
  );
}
