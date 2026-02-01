# Guía de Pruebas en Dispositivo Físico

Para probar la aplicación con **Anuncios (AdMob)** y **Mapas de Google**, NO puedes usar "Expo Go" estándar. Necesitas crear una **Development Build**.

## ¿Por qué?
Las librerías de anuncios (`react-native-google-mobile-ads`) usan código nativo que no está incluido en la app genérica de Expo Go.

## Pasos para Probar

### 1. Instalar EAS CLI (Si no lo tienes)
```bash
lo hace si
```

### 2. Iniciar Sesión en Expo
```bash
eas login
```

### 3. Configurar el Proyecto
```bash
eas build:configure
```
*(Selecciona `Android` o `iOS` según tu dispositivo)*

### 4. Crear la Build de Desarrollo
Conecta tu teléfono al ordenador o asegúrate de tener el simulador listo.
guardado 
**Para Android (APK para instalar directo):**
```bash
eas build -p android --profile development --local
```
*Nota: `--local` construye en tu máquina. Si falla, quítalo para construir en la nube de Expo.*

**Para iOS (Requiere cuenta de Apple Developer):**
```bash
eas build -p ios --profile development
```

### 5. Instalar y Correr
1.  Al terminar, EAS te dará un código QR o un link. Instala esa app en tu teléfono.
2.  En tu terminal, corre el servidor de desarrollo:
    ```bash
    npx expo start --dev-client
    ```
3.  Escanea el QR desde la **nueva app** que instalaste (no desde Expo Go).

---

## 🚀 Checklist de Prueba en Campo (Field Test)

Sigue estos pasos para verificar las últimas correcciones (Audio, Notificaciones, Favoritos):

### Paso 1: Reconstruir (IMPORTANTE)
Como modificamos **Audio** y **Notificaciones** (código nativo), debes generar una nueva build:
```bash
eas build -p android --profile development
```
*Instala la nueva actualización en tu teléfono.*

### Paso 2: Verificar Audio (Spotify)
1.  Abre **Spotify** y pon música.
2.  Abre **Despiértame**.
3.  Configura una alarma cercana.
4.  Espera a que suene.
5.  **Resultado Esperado**: El volumen de Spotify debe **bajar** (ducking) mientras la alarma habla, y subir cuando termina.

### Paso 3: Verificar Notificaciones
1.  Deja que la alarma suene por un rato.
2.  Mira la barra de notificaciones.
3.  **Resultado Esperado**: Solo debe haber **UNA** notificación que se actualiza, no una lista infinita.

### Paso 4: Verificar Favoritos y UI
1.  Toca el botón **⭐** (Arriba Derecha).
2.  Selecciona un favorito.
3.  **Resultado Esperado**: El panel se cierra y el mapa viaja al destino.
4.  Verifica que el mapa no toque los banners de publicidad (márgenes correctos).
