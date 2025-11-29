# Despiértame 😴🚌

Aplicación móvil inteligente para viajeros que te despierta cuando estás llegando a tu destino. Ideal para no pasarte de parada en el transporte público.

## 📱 Características

- **Búsqueda Inteligente**: Integración con Google Places para encontrar cualquier destino.
- **Mapa Interactivo**: Visualización clara de tu ubicación y destino usando Google Maps.
- **Tracking en Tiempo Real**: Monitoreo constante de tu posición.
- **Multilingüe**: Soporte automático para Español, Portugués e Inglés (UI y Voz).
- **Modo Segundo Plano**: Funciona incluso con la pantalla apagada o usando otras apps.
- **Alarma por Voz**: La app te hablará diciendo "Se acerca a su destino" (en tu idioma) repetidamente.
- **Vibración Continua**: Patrón de vibración intenso para asegurar el despertar.
- **Alarma Personalizable**: Configura el radio de alerta (200m, 500m, 1km).

## 🛠 Requisitos Técnicos

- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- Dispositivo físico (iOS/Android) o Simulador
- **Google Maps API Key** (con Maps SDK for Android/iOS y Places API habilitados)

## 🚀 Instalación

1. **Clonar el repositorio** (o descargar los archivos):
   ```bash
   # Si estás en la carpeta del proyecto
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

3. **Añadir Sonido de Alarma**:
   Coloca un archivo de audio real en `assets/alarm.mp3`. El archivo actual es solo un placeholder de texto.

## 🏃‍♂️ Ejecución

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## 🔐 Permisos

La aplicación solicitará permisos de ubicación:
- **"Al usar la app"**: Para mostrar tu ubicación en el mapa.
- **"Siempre"**: CRÍTICO para que la alarma funcione con la pantalla apagada. Debes seleccionar "Permitir siempre" cuando se solicite o cambiarlo en Configuración.
- **Notificaciones**: Para mantener el servicio en segundo plano activo (Android).

## 🏗 Estructura del Proyecto

```
/src
  /components   # UI reutilizable (Mapa, Buscador, Panel Info)
  /constants    # Tema, colores, configuración
  /hooks        # Lógica de negocio (Location Tracker)
  /screens      # Pantallas (HomeScreen)
  /store        # Estado global (Zustand)
  /utils        # Funciones auxiliares (Cálculo distancia)
App.tsx         # Entry point
app.config.ts   # Configuración de Expo
```

## 📝 Notas de Desarrollo

- **Arquitectura**: Se usó una arquitectura modular basada en características y capas (UI, State, Logic).
- **Estado**: Gestionado con `zustand` por su simplicidad y rendimiento.
- **Mapas**: `react-native-maps` para renderizado nativo de mapas.
- **Geolocalización**: `expo-location` con `watchPositionAsync` para un balance entre precisión y batería.

## ⚠️ Solución de Problemas Comunes

- **El mapa no carga**: Verifica que tu API Key de Google tenga habilitado "Maps SDK for Android" y "Maps SDK for iOS".
- **La búsqueda no funciona**: Verifica que tu API Key tenga habilitado "Places API".
- **Error de facturación**: Asegúrate de que tu cuenta de Google Cloud tenga una cuenta de facturación asociada (requisito de Google).
