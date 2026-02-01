# Despiértame 😴🚌

Aplicación móvil inteligente para viajeros que te despierta cuando estás llegando a tu destino. Ideal para no pasarte de parada en el transporte público.

## 📱 Características Principales

- **Búsqueda Inteligente**: Integración con Google Places para encontrar cualquier destino.
- **Mapa Interactivo**: Visualización clara de tu ubicación y destino usando Google Maps.
- **Tracking en Tiempo Real**: Monitoreo constante de tu posición.
- **Multilingüe**: Soporte automático para Español, Portugués e Inglés (UI y Voz).
- **Modo Segundo Plano**: Funciona incluso con la pantalla apagada o usando otras apps.
- **Alarma Continua e Ininterrumpida**:
  - **Voz**: La app te hablará repetidamente hasta que despiertes.
  - **Vibración**: Patrón de vibración intenso e infinito.
  - **Notificaciones de Alta Prioridad**: Despiertan el dispositivo incluso si está en reposo.
- **Modelo Freemium**: 
  - 1 viaje diario gratis.
  - Viajes adicionales desbloqueables viendo anuncios (simulados).
  - Opción Premium para viajes ilimitados.

## 🛠 Requisitos Técnicos

- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- Dispositivo físico (Android recomendado para pruebas de background)
- **Google Maps API Key** (con Maps SDK for Android/iOS y Places API habilitados)

## 🚀 Instalación

1. **Clonar el repositorio** (o descargar los archivos):
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno**:
   Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Edita `.env` y añade tus claves de Google:
   ```
   GOOGLE_MAPS_API_KEY=tu_clave_aqui
   GOOGLE_PLACES_API_KEY=tu_clave_aqui
   ```

## 📦 Construcción del APK

Para generar el archivo instalable (APK) para Android:

1. Sigue las instrucciones detalladas en [INSTRUCCIONES_BUILD_APK.md](./INSTRUCCIONES_BUILD_APK.md).
2. Comando rápido (si ya tienes EAS configurado):
   ```bash
   npx eas-cli build --profile preview --platform android
   ```

## 🎨 Generación de Iconos

Hemos incluido una herramienta para generar iconos personalizados y llamativos:

1. Abre el generador en tu navegador:
   ```bash
   open assets/generator.html
   ```
2. Selecciona tu paleta de colores favorita.
3. Descarga los assets y reemplázalos en la carpeta `assets/`.
4. Consulta [INSTRUCCIONES_ICONOS.md](./INSTRUCCIONES_ICONOS.md) para más detalles.

## 🏃‍♂️ Ejecución en Desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# Presiona 'a' para abrir en Android
# Presiona 'i' para abrir en iOS
```

## 🔐 Permisos

La aplicación solicitará permisos críticos:
- **Ubicación "Siempre"**: NECESARIO para que la alarma funcione en background.
- **Notificaciones**: NECESARIO para despertar el dispositivo cuando llegues.
- **Superposición**: Para mostrar alertas sobre otras apps (opcional según versión de Android).

## 🏗 Estructura del Proyecto

```
/src
  /components   # UI reutilizable (Mapa, Buscador, Panel Info)
  /constants    # Tema, colores, configuración
  /hooks        # Lógica de negocio (Location Tracker)
  /screens      # Pantallas (HomeScreen)
  /store        # Estado global (Zustand)
  /tasks        # Tareas en segundo plano (Background Location)
  /utils        # Funciones auxiliares (Notificaciones, Distancia)
App.tsx         # Entry point
app.config.ts   # Configuración de Expo
```

## ⚠️ Solución de Problemas

- **La alarma no suena en background**: 
  - Asegúrate de haber otorgado permiso de ubicación "Siempre".
  - Verifica que no tengas activado el "Ahorro de batería" estricto para esta app.
- **El mapa no carga**: Verifica tus API Keys de Google.
- **Crash al iniciar**: Revisa los logs con `adb logcat`. Hemos agregado manejo de errores robusto para diagnosticar problemas.

## 📄 Licencia

Este proyecto es software propietario. Todos los derechos reservados.
