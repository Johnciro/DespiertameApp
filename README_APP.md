# Despiértame - Documentación Técnica

## 📱 Descripción
Despiértame es una aplicación de alarma basada en ubicación que despierta a los usuarios cuando llegan a su destino. Utiliza un modelo Freemium con límites de API para garantizar la rentabilidad.

## 🛠 Configuración del Entorno

### Requisitos
- Node.js > 14
- Expo CLI
- Cuenta de Google Cloud Platform (para API Keys)

### Instalación
```bash
npm install
```

### Variables de Entorno
El proyecto utiliza `app.json` (o `app.config.js`) para la configuración.
Asegúrate de configurar `GOOGLE_PLACES_API_KEY` en `Constants.expoConfig.extra`.

## 🏗 Arquitectura

### Stack
- **Framework**: React Native (Expo)
- **Estado**: Zustand (`src/store/useAppStore.ts`)
- **Mapas**: `react-native-maps`
- **Búsqueda**: `react-native-google-places-autocomplete`

### Modelo de Negocio (Freemium)
- **Usuarios Free**:
    - Máximo 3 Favoritos.
    - Favoritos bloqueados por 30 días (para evitar abuso de API).
    - Publicidad (Banners + Intersticiales).
- **Usuarios Premium**:
    - Favoritos ilimitados.
    - Sin anuncios.
    - Sin bloqueo de 30 días.

## 🚀 Despliegue

### Android (APK/AAB)
```bash
eas build -p android
```

### iOS
```bash
eas build -p ios
```

## ⚠️ Notas Importantes
- **Costos API**: La lógica de "Favoritos" es crítica para la rentabilidad. No modificar el límite de 3 favoritos o el bloqueo de 30 días sin revisar `ANALISIS_RENTABILIDAD_V2.md`.
- **Pagos**: Actualmente usa un servicio Mock (`src/services/payment.ts`). Para producción, integrar RevenueCat o Expo IAP.
