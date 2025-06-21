# 🧴 EliPerfumes

Una tienda web de perfumes desarrollada para apoyar el emprendimiento de mi mamá, ofreciendo una forma sencilla, visual y atractiva de mostrar los perfumes disponibles y gestionar su catálogo.

## ✨ Características

- Catálogo de perfumes con imágenes y detalles.
- Panel de administración protegido por login.
- Subida de imágenes con compresión y validación (`.webp` y < 500KB).
- Indicador automático de perfumes "Nuevos" por 7 días.
- Enlace directo a WhatsApp para realizar pedidos.
- Diseño responsive (adaptado a móvil, tablet y escritorio).
- Proyecto optimizado para despliegue en [Vercel](https://vercel.com/).

## 🛠️ Tecnologías utilizadas

- **React + Vite**
- **Tailwind CSS**
- **Supabase (Base de datos y almacenamiento)**
- **JavaScript (ES6+)**
- **Git y GitHub**

## 📂 Estructura del proyecto

📁 public
📁 src
┣ 📁 components
┣ 📁 hooks
┣ 📁 pages
┣ 📁 lib
┗ 📄 main.jsx
## 🚀 Cómo ejecutar localmente

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

2. Instala las dependencias:
npm install

3. Crea un archivo .env con tu URL y clave de Supabase:
VITE_SUPABASE_URL=TU_URL
VITE_SUPABASE_KEY=TU_CLAVE

4. Ejecuta en modo desarrollo
npm run dev

🙋‍♀️ Autor y propósito
Este proyecto fue creado con amor por el hijo de la emprendedora, para ayudarla a iniciar su venta de perfumes importados en Ecuador.

✅ Por hacer en el futuro
Integración de sistema de stock.

Panel de pedidos con notificación.

Mejora de accesibilidad (a11y).

Optimización SEO para buscadores.