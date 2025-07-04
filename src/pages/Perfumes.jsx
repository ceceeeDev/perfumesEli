import { useEffect, useState } from "react"
import { supabase } from '@/supabase/supabaseClient';
import { Link } from "react-router-dom"

export default function Perfumes() {
  const [perfumes, setPerfumes] = useState([])

  useEffect(() => {
    const fetchPerfumes = async () => {
      const { data, error } = await supabase
        .from("perfumes")
        .select("*");

      if (error) {
        console.error("Error al obtener perfumes:", error);
      } else {
        // Ordenar: disponibles primero, luego próximamente, después agotados, y dentro de cada grupo por precio ascendente
        const ordenados = data
          .slice()
          .sort((a, b) => {
            // Obtener el estado actual (nuevo campo o compatibilidad con stock)
            const estadoA = a.estado || "disponible";
            const estadoB = b.estado || "disponible";

            
            // Prioridad de estados: disponible (1), proximamente (2), agotado (3)
            const prioridadEstado = {
              "disponible": 1,
              "proximamente": 2,
              "agotado": 3
            };
            
            const prioridadA = prioridadEstado[estadoA] || 3;
            const prioridadB = prioridadEstado[estadoB] || 3;
            
            if (prioridadA !== prioridadB) {
              return prioridadA - prioridadB;
            }
            
            // Si tienen la misma prioridad, ordenar por precio
            return a.precio - b.precio;
          });

        setPerfumes(ordenados);
      }
    }

    fetchPerfumes()
  }, [])

  // Función para obtener información del estado
  const getEstadoInfo = (perfume) => {
    const estado = perfume.estado || "disponible";
    
    switch (estado) {
      case "disponible":
        return { 
          emoji: "✨", 
          texto: "Disponible", 
          clase: "bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse",
          disponible: true
        };
      case "agotado":
        return { 
          emoji: "❌", 
          texto: "Agotado", 
          clase: "bg-gradient-to-r from-red-400 to-pink-500 text-white",
          disponible: false
        };
      case "proximamente":
        return { 
          emoji: "⏳", 
          texto: "Próximamente", 
          clase: "bg-gradient-to-r from-gray-600 to-gray-700 text-white animate-pulse",
          disponible: false
        };
      default:
        return { 
          emoji: "✨", 
          texto: "Disponible", 
          clase: "bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse",
          disponible: true
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="h-full overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header con gradiente de texto y efecto shimmer */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">
              Perfumes Exclusivos
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Descubre tu fragancia perfecta ✨
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
            </div>
          </div>

          {/* Grid con animaciones staggered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {perfumes.map((perfume, index) => {
              const estadoInfo = getEstadoInfo(perfume);
              
              return (
                <Link
                  to={`/perfume/${perfume.id}`}
                  key={perfume.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.05] hover:-translate-y-2 overflow-hidden border border-white/50"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Efecto de brillo que se mueve en hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                  
                  {/* Contenedor de imagen con efectos visuales */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={perfume.imagen_url}
                      alt={perfume.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Overlay gradiente sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badge de estado actualizado */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${estadoInfo.clase}`}>
                        {estadoInfo.emoji} {estadoInfo.texto}
                      </span>
                    </div>

                    {/* Efecto especial para "Próximamente" */}
                    {perfume.estado === "proximamente" && (
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent flex items-end justify-center pb-4">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-bounce shadow-lg">
                          🚀 ¡Muy Pronto!
                        </div>
                      </div>
                    )}

                    {/* Efecto de corazón flotante en hover - solo para disponibles */}
                    {estadoInfo.disponible && (
                      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center text-white text-sm animate-bounce">
                          💖
                        </div>
                      </div>
                    )}

                    {/* Overlay especial para no disponibles */}
                    {!estadoInfo.disponible && perfume.estado !== "proximamente" && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="transform rotate-12">
                          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                            SIN STOCK
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contenido con efectos de color dinámicos */}
                  <div className="p-6 space-y-4 relative">
                    {/* Nombre del perfume con efecto hover */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                        {perfume.nombre}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1 font-semibold tracking-wide uppercase">
                        {perfume.marca}
                      </p>
                    </div>

                    {/* Precio con efecto brillante */}
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ${parseFloat(perfume.precio).toLocaleString()}
                        </p>
                        {/* Efecto de brillo en el precio */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </div>
                      
                      {/* Botón CTA con mensaje dinámico según estado */}
                      <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-all duration-300 transform group-hover:scale-105 ${
                        estadoInfo.disponible 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white group-hover:shadow-xl group-hover:from-pink-600 group-hover:to-purple-700'
                          : perfume.estado === "proximamente"
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                      }`}>
                        {estadoInfo.disponible ? "Ver más ✨" : 
                         perfume.estado === "proximamente" ? "Pronto 🚀" : "Agotado 😔"}
                      </div>
                    </div>

                    {/* Barra de "popularidad" mejorada según estado */}
                    <div className="pt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>
                          {estadoInfo.disponible ? "🔥" : 
                           perfume.estado === "proximamente" ? "⭐" : "💤"}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-1000 ${
                              estadoInfo.disponible 
                                ? 'bg-gradient-to-r from-orange-400 to-red-500 group-hover:from-pink-500 group-hover:to-purple-500'
                                : perfume.estado === "proximamente"
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                  : 'bg-gray-400'
                            }`}
                            style={{ 
                              width: estadoInfo.disponible ? `${Math.floor(Math.random() * 20 + 80)}%` :
                                     perfume.estado === "proximamente" ? "60%" : "20%"
                            }}
                          ></div>
                        </div>
                        <span className="font-medium">
                          {estadoInfo.disponible ? "Muy popular" : 
                           perfume.estado === "proximamente" ? "Esperado" : "Sin stock"}
                        </span>
                      </div>
                    </div>

                    {/* Mensaje especial para próximamente */}
                    {perfume.estado === "proximamente" && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mt-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-lg">🎯</span>
                          <span className="font-semibold text-yellow-800">
                            ¡Próximo lanzamiento! Mantente atento
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Efecto de borde brillante en hover - solo para disponibles */}
                  {estadoInfo.disponible && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 transition-all duration-300 pointer-events-none"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Estado vacío más atractivo */}
          {perfumes.length === 0 && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 animate-bounce">✨</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Algo mágico está por llegar...
              </h3>
              <p className="text-gray-600 text-lg">
                Estamos preparando una colección increíble para ti
              </p>
            </div>
          )}
        </div>

        {/* Botón flotante de contacto */}
        <a
          href="https://wa.me/593978984433" // Reemplaza con tu número real
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 sm:right-1/2 sm:translate-x-1/2 sm:left-auto z-50 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-5 py-3 rounded-full shadow-lg text-sm font-semibold transition-transform hover:scale-105 w-max text-center"
        >
          ¿No encontraste lo que buscabas? <br className="block sm:hidden" />¡Contáctanos!
        </a>

        {/* CSS para las animaciones y body styling */}
        <style jsx="true" global="true">{`
          body {
            background: linear-gradient(to bottom right, #fdf2f8, #f3e8ff, #e0e7ff) !important;
            margin: 0;
            padding: 0;
          }
          html {
            background: linear-gradient(to bottom right, #fdf2f8, #f3e8ff, #e0e7ff) !important;
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  )
}