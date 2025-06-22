import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from '@/supabase/supabaseClient';
import { FaWhatsapp, FaShare, FaStar, FaArrowLeft } from "react-icons/fa"

export default function PerfumeDetail() {
  const { id } = useParams()
  const [perfume, setPerfume] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    const fetchPerfume = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("perfumes")
          .select("*")
          .eq("id", id)
          .single()

        if (error) {
          console.error("Error al obtener el perfume:", error)
          setError("No se pudo cargar el perfume")
        } else {
          setPerfume(data)
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Error de conexión")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPerfume()
    }
  }, [id])

  // Función para obtener información del estado (igual que en Perfumes.jsx)
  const getEstadoInfo = (perfume) => {
    const estado = perfume.estado || (perfume.stock ? "disponible" : "agotado");
    
    switch (estado) {
      case "disponible":
        return { 
          emoji: "✨", 
          texto: "Disponible", 
          clase: "bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse",
          disponible: true,
          descripcion: "¡Perfecto! Este perfume está listo para ser tuyo"
        };
      case "agotado":
        return { 
          emoji: "❌", 
          texto: "Agotado", 
          clase: "bg-gradient-to-r from-red-400 to-pink-500 text-white",
          disponible: false,
          descripcion: "Temporalmente sin stock, pero volverá pronto"
        };
      case "proximamente":
        return { 
          emoji: "⏳", 
          texto: "Próximamente", 
          clase: "bg-gradient-to-r from-gray-600 to-gray-700 text-white animate-pulse",
          disponible: false,
          descripcion: "¡Muy pronto! Este increíble perfume llegará en breve"
        };
      default:
        return { 
          emoji: "✨", 
          texto: "Disponible", 
          clase: "bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse",
          disponible: true,
          descripcion: "¡Perfecto! Este perfume está listo para ser tuyo"
        };
    }
  };

  const handleWhatsAppClick = () => {
    if (!perfume) return
    
    const estadoInfo = getEstadoInfo(perfume);
    let message;
    
    if (estadoInfo.disponible) {
      message = `¡Hola! Me interesa el perfume ${perfume.nombre} de ${perfume.marca} por $${parseFloat(perfume.precio).toLocaleString()}. ¿Está disponible?`
    } else if (perfume.estado === "proximamente") {
      message = `¡Hola! Me interesa el perfume ${perfume.nombre} de ${perfume.marca} que está próximamente. ¿Podrías avisarme cuando esté disponible?`
    } else {
      message = `¡Hola! Me interesa el perfume ${perfume.nombre} de ${perfume.marca}. ¿Sabes cuándo volverá a estar disponible?`
    }
    
    const whatsappUrl = `https://wa.me/593978984433?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleShare = async () => {
    if (!perfume) return

    const estadoInfo = getEstadoInfo(perfume);
    const shareData = {
      title: `${perfume.nombre} - ${perfume.marca}`,
      text: `¡Mira este increíble perfume! ${perfume.nombre} de ${perfume.marca} ${estadoInfo.disponible ? `por solo $${parseFloat(perfume.precio || 0).toLocaleString()}` : `- ${estadoInfo.descripcion}`} ✨`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce'
      notification.textContent = '¡Enlace copiado! 📋'
      document.body.appendChild(notification)
      
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    } catch (err) {
      alert('Copia este enlace: ' + window.location.href)
    }
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-spin">✨</div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Cargando perfume...
          </h3>
          <p className="text-gray-600">Preparando algo especial para ti</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error || !perfume) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">😔</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Perfume no encontrado"}
          </h3>
          <p className="text-gray-600 mb-8">
            Lo sentimos, no pudimos cargar la información de este perfume.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <FaArrowLeft />
            <span>Volver</span>
          </button>
        </div>
      </div>
    )
  }

  const estadoInfo = getEstadoInfo(perfume);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="h-full overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header con botones de navegación y compartir */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => window.history.back()}
              className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl text-gray-600 hover:text-pink-600 transition-all duration-300 transform hover:scale-105 border border-white/50"
              aria-label="Volver atrás"
            >
              <FaArrowLeft className="group-hover:animate-pulse transition-all duration-300" />
              <span className="font-semibold group-hover:text-pink-600 transition-colors duration-300">
                Volver
              </span>
            </button>

            <button 
              onClick={handleShare}
              className="group flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl text-gray-600 hover:text-purple-600 transition-all duration-300 transform hover:scale-105 border border-white/50"
              aria-label="Compartir perfume"
            >
              <FaShare className="group-hover:animate-pulse transition-all duration-300" />
              <span className="font-semibold group-hover:text-purple-600 transition-colors duration-300">
                Compartir
              </span>
            </button>
          </div>

          {/* Contenido principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Imagen del perfume */}
            <div className="relative">
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl group">
                {/* Efecto de brillo que se mueve */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-10"></div>
                
                <img
                  src={perfume.imagen_url || '/placeholder-perfume.jpg'}
                  alt={`${perfume.nombre} - ${perfume.marca}`}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
                
                {/* Overlay gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* Badge de estado actualizado */}
                <div className="absolute top-6 right-6 z-20">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${estadoInfo.clase}`}>
                    {estadoInfo.emoji} {estadoInfo.texto}
                  </span>
                </div>

                {/* Efecto especial para "Próximamente" */}
                {perfume.estado === "proximamente" && (
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent flex items-end justify-center pb-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold animate-bounce shadow-lg">
                      🚀 ¡Muy Pronto Disponible!
                    </div>
                  </div>
                )}

                {/* Overlay especial para no disponibles (excepto próximamente) */}
                {!estadoInfo.disponible && perfume.estado !== "proximamente" && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="transform rotate-12">
                      <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg">
                        SIN STOCK
                      </div>
                    </div>
                  </div>
                )}

                {/* Estrellas decorativas flotantes - solo para disponibles */}
                {estadoInfo.disponible && (
                  <div className="absolute top-6 left-6 opacity-80">
                    <div className="flex space-x-1">
                      <FaStar className="text-yellow-400 text-sm animate-pulse" />
                      <FaStar className="text-yellow-400 text-sm animate-pulse delay-200" />
                      <FaStar className="text-yellow-400 text-sm animate-pulse delay-400" />
                      <FaStar className="text-yellow-400 text-sm animate-pulse delay-600" />
                      <FaStar className="text-yellow-400 text-sm animate-pulse delay-800" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Elementos decorativos alrededor de la imagen */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full animate-bounce opacity-60 delay-1000"></div>
            </div>

            {/* Información del perfume */}
            <div className="space-y-8">
              
              {/* Título y marca */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {perfume.marca}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                    {perfume.nombre}
                  </h1>
                </div>
                
                {/* Barra decorativa */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                  <div className="text-2xl">
                    {estadoInfo.disponible ? "✨" : 
                     perfume.estado === "proximamente" ? "🚀" : "😔"}
                  </div>
                  <div className="flex-1 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                </div>

                {/* Estado del perfume con descripción */}
                <div className={`rounded-2xl p-4 border-2 ${
                  estadoInfo.disponible 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                    : perfume.estado === "proximamente"
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {estadoInfo.disponible ? "🎉" : 
                       perfume.estado === "proximamente" ? "⭐" : "💤"}
                    </span>
                    <div>
                      <h3 className={`font-bold text-lg ${
                        estadoInfo.disponible ? 'text-green-800' :
                        perfume.estado === "proximamente" ? 'text-yellow-800' : 'text-red-800'
                      }`}>
                        {estadoInfo.texto}
                      </h3>
                      <p className="text-gray-600 text-sm">{estadoInfo.descripcion}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {perfume.descripcion && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">🌸</span>
                    Descripción
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {showFullDescription
                      ? perfume.descripcion
                      : perfume.descripcion.slice(0, 180) + (perfume.descripcion.length > 180 ? "..." : "")}
                  </p>

                  {perfume.descripcion.length > 180 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 text-sm text-purple-600 font-semibold underline hover:text-purple-800 transition-colors"
                    >
                      {showFullDescription ? "Ver menos" : "Ver más"}
                    </button>
                  )}
                </div>
              )}

              {/* Precio destacado */}
              <div className="relative">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-600 mb-1">
                        {estadoInfo.disponible ? "Precio especial" : 
                         perfume.estado === "proximamente" ? "Precio estimado" : "Precio anterior"}
                      </p>
                      <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ${parseFloat(perfume.precio || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-4xl animate-bounce">
                      {estadoInfo.disponible ? "💰" : 
                       perfume.estado === "proximamente" ? "🎯" : "⏰"}
                    </div>
                  </div>
                </div>
                
                {/* Efecto de brillo en el precio - solo para disponibles */}
                {estadoInfo.disponible && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent -translate-x-full animate-pulse rounded-2xl"></div>
                )}
              </div>

              {/* Características adicionales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="text-sm font-semibold text-gray-600">Larga duración</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-2xl mb-2">🌟</div>
                  <p className="text-sm font-semibold text-gray-600">Exclusivo</p>
                </div>
              </div>

              {/* Botón de WhatsApp - adaptativo según estado */}
              <div className="relative">
                <button
                  onClick={handleWhatsAppClick}
                  className={`w-full font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 text-lg group relative overflow-hidden ${
                    estadoInfo.disponible 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                      : perfume.estado === "proximamente"
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  }`}
                  aria-label="Contactar por WhatsApp"
                >
                  {/* Efecto de brillo que se mueve */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <FaWhatsapp className="text-2xl animate-pulse" />
                  <span className="relative z-10">
                    {estadoInfo.disponible ? "Pedir por WhatsApp ✨" :
                     perfume.estado === "proximamente" ? "Consultar disponibilidad 🚀" :
                     "Preguntar por restock 💬"}
                  </span>
                </button>
                
                {/* Texto motivacional adaptativo */}
                <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                  {estadoInfo.disponible ? "🔥 ¡Solo quedan pocas unidades disponibles!" :
                   perfume.estado === "proximamente" ? "⭐ ¡Sé el primero en saberlo cuando llegue!" :
                   "💌 ¡Te avisamos cuando vuelva a estar disponible!"}
                </p>
              </div>

              {/* Mensaje especial para próximamente */}
              {perfume.estado === "proximamente" && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200 text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">¡Próximo lanzamiento!</h3>
                  <p className="text-gray-600">Este increíble perfume estará disponible muy pronto. ¡Contáctanos para más información!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS para las animaciones */}
      <style jsx="true" global="true">{`
        body {
          background: linear-gradient(to bottom right, #fdf2f8, #f3e8ff, #e0e7ff) !important;
          margin: 0;
          padding: 0;
        }
        html {
          background: linear-gradient(to bottom right, #fdf2f8, #f3e8ff, #e0e7ff) !important;
        }
      `}</style>
    </div>
  )
}