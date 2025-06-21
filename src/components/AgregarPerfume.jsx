import { useEffect, useState } from "react";
import { supabase } from '@/supabase/supabaseClient';
import Swal from "sweetalert2";

export default function AgregarPerfume() {
  const [nombre, setNombre] = useState("");
  const [marca, setMarca] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenFile, setImagenFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imagenOriginalUrl, setImagenOriginalUrl] = useState("");
  const [stock, setStock] = useState(true);
  const [perfumes, setPerfumes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    obtenerPerfumes();
  }, []);

  const obtenerPerfumes = async () => {
    const { data, error } = await supabase.from("perfumes").select("*");
    if (error) {
      console.error("Error al obtener perfumes:", error.message);
    } else {
      setPerfumes(data);
    }
  };

  const limpiarCampos = () => {
    setNombre("");
    setMarca("");
    setPrecio("");
    setDescripcion("");
    setImagenFile(null);
    setPreviewUrl("");
    setImagenOriginalUrl("");
    setStock(true);
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagenFile && !imagenOriginalUrl) {
      Swal.fire({
        icon: "error",
        title: "Imagen requerida",
        text: "Debes subir una imagen en formato .webp para continuar.",
      });
      return;
    }

    Swal.fire({
      title: "Guardando...",
      text: "Por favor espera",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    let imagenUrl = imagenOriginalUrl;

    if (imagenFile) {
      // Eliminar imagen anterior si existe y se está editando
      if (editandoId && imagenOriginalUrl) {
        const pathAnterior = decodeURIComponent(
          imagenOriginalUrl.split("/").slice(-2).join("/")
        );
        await supabase.storage.from("imagenes-perfumes").remove([pathAnterior]);
      }

      const fileExt = imagenFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `perfumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes-perfumes")
        .upload(filePath, imagenFile);

      if (uploadError) {
        Swal.fire("Error", "No se pudo subir la imagen.", "error");
        return;
      }

      const { data, error: urlError } = supabase.storage
        .from("imagenes-perfumes")
        .getPublicUrl(filePath);

      if (urlError) {
        Swal.fire("Error", "No se pudo obtener la URL de la imagen.", "error");
        return;
      }

      imagenUrl = data.publicUrl;
    }

    const perfumeData = {
      nombre,
      marca,
      precio: parseFloat(precio),
      descripcion,
      imagen_url: imagenUrl,
      stock,
    };

    let response;
    if (editandoId) {
      response = await supabase
        .from("perfumes")
        .update(perfumeData)
        .eq("id", editandoId);
    } else {
      response = await supabase.from("perfumes").insert([perfumeData]);
    }

    const { error } = response;

    if (error) {
      Swal.fire("Error", error.message || "No se pudo guardar el perfume.", "error");
    } else {
      Swal.fire({
        icon: "success",
        title: editandoId ? "Perfume actualizado" : "Perfume agregado",
        showConfirmButton: false,
        timer: 1800,
      });
      limpiarCampos();
      obtenerPerfumes();
    }
  };

  const eliminarPerfume = async (id) => {
    const perfume = perfumes.find((p) => p.id === id);

    const confirmar = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esto eliminará el perfume permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmar.isConfirmed) {
      if (perfume.imagen_url) {
        const path = decodeURIComponent(
          perfume.imagen_url.split("/").slice(-2).join("/")
        );
        await supabase.storage.from("imagenes-perfumes").remove([path]);
      }

      const { error } = await supabase.from("perfumes").delete().eq("id", id);
      if (error) {
        Swal.fire("Error", "No se pudo eliminar.", "error");
      } else {
        obtenerPerfumes();
        Swal.fire("Eliminado", "El perfume fue eliminado.", "success");
      }
    }
  };

  const cargarParaEditar = (perfume) => {
    setNombre(perfume.nombre);
    setMarca(perfume.marca);
    setPrecio(perfume.precio);
    setDescripcion(perfume.descripcion);
    setStock(perfume.stock);
    setPreviewUrl(perfume.imagen_url || "");
    setImagenOriginalUrl(perfume.imagen_url || "");
    setImagenFile(null);
    setEditandoId(perfume.id);
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const maxSizeInBytes = 500 * 1024; // 500 KB
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (fileExtension !== "webp") {
        Swal.fire({
          icon: "error",
          title: "Formato no permitido",
          text: "Solo se permiten imágenes en formato .webp",
        });
        return;
      }

      if (file.size > maxSizeInBytes) {
        Swal.fire({
          icon: "error",
          title: "Imagen demasiado grande",
          text: "Por favor, sube una imagen de máximo 500 KB.",
        });
        return;
      }

      setImagenFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header moderno - Responsive */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-4 px-2">
            {editandoId ? "✨ Editar Catálogo" : "✨ Panel de Administración"}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium px-4">
            {editandoId ? "Actualiza la información del perfume" : "Gestiona tu catálogo de fragancias"}
          </p>
          <div className="mt-2 sm:mt-4 flex justify-center">
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Formulario moderno - Responsive */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/50 order-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm sm:text-lg lg:text-xl font-bold mr-3 sm:mr-4 flex-shrink-0">
                {editandoId ? "✏️" : "➕"}
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                {editandoId ? "Editar Perfume" : "Nuevo Perfume"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Nombre del perfume */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  💎 Nombre del Perfume
                </label>
                <input
                  type="text"
                  placeholder="Ej: Chanel No. 5"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  🏷️ Marca
                </label>
                <input
                  type="text"
                  placeholder="Ej: Chanel, Dior, Versace"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  💰 Precio
                </label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-green-600 font-bold text-sm sm:text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  📝 Descripción
                </label>
                <textarea
                  placeholder="Describe las notas del perfume, ocasión de uso, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows="3"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                />
              </div>

              {/* Imagen */}
              <div className="space-y-3 sm:space-y-4">
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1">
                  📸 Imagen del Perfume
                </label>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".webp"
                    onChange={handleImagenChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="imagen-upload"
                  />
                  <label 
                    htmlFor="imagen-upload"
                    className="flex items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-purple-300 rounded-lg sm:rounded-xl bg-purple-50 hover:bg-purple-100 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="text-center px-4">
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform">📷</div>
                      <p className="text-purple-600 font-semibold text-xs sm:text-sm">
                        {imagenFile ? imagenFile.name : "Haz clic para subir imagen"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">.webp hasta 500KB</p>
                    </div>
                  </label>
                </div>

                {/* Preview de imagen */}
                {previewUrl && (
                  <div className="relative group">
                    <img 
                      src={previewUrl} 
                      alt="Vista previa" 
                      className="w-full max-h-48 sm:max-h-64 object-cover rounded-lg sm:rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        Vista previa
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-green-200">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={stock}
                      onChange={() => setStock(!stock)}
                      className="sr-only"
                    />
                    <div className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-all duration-300 ${
                      stock ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        stock ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}></div>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm sm:text-lg font-bold text-gray-800 block">
                      {stock ? "✅ Disponible en stock" : "❌ Sin stock"}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {stock ? "Los clientes pueden comprar este perfume" : "Producto agotado"}
                    </p>
                  </div>
                </label>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-lg font-bold hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {editandoId ? "💾 Guardar Cambios" : "✨ Agregar Perfume"}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    onClick={limpiarCampos}
                    className="w-full bg-gray-500 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-600 transition-all duration-300"
                  >
                    ❌ Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de perfumes moderna - Responsive */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/50 order-2">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm sm:text-lg lg:text-xl font-bold mr-3 sm:mr-4 flex-shrink-0">
                  📋
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Mis Perfumes</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{perfumes.length} productos registrados</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
              {perfumes.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">🌸</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">No hay perfumes aún</h3>
                  <p className="text-sm sm:text-base text-gray-500">Agrega tu primer perfume para comenzar</p>
                </div>
              ) : (
                perfumes.map((perfume) => (
                  <div 
                    key={perfume.id} 
                    className="bg-gradient-to-r from-white to-gray-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {/* Imagen pequeña */}
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {perfume.imagen_url ? (
                          <img 
                            src={perfume.imagen_url} 
                            alt={perfume.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg sm:text-2xl">
                            🌸
                          </div>
                        )}
                      </div>

                      {/* Info del perfume */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">{perfume.nombre}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{perfume.marca}</p>
                        <div className="flex items-center space-x-2 sm:space-x-3 mt-1">
                          <span className="text-sm sm:text-lg font-bold text-green-600">
                            ${parseFloat(perfume.precio).toFixed(2)}
                          </span>
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                            perfume.stock 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {perfume.stock ? '✅ Stock' : '❌ Agotado'}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                        <button
                          onClick={() => cargarParaEditar(perfume)}
                          className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-md sm:rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-semibold min-w-0"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => eliminarPerfume(perfume.id)}
                          className="p-1.5 sm:p-2 bg-red-500 text-white rounded-md sm:rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-semibold min-w-0"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}