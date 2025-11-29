# Cómo probar Despiértame en tu Samsung Galaxy S23 Ultra 📱

Para probar la aplicación en tu dispositivo físico sin necesidad de compilar una APK completa, utilizaremos **Expo Go**. Es la forma más rápida y sencilla.

## 1. Preparar tu Teléfono
1. Ve a la **Google Play Store** en tu S23 Ultra.
2. Busca e instala la aplicación **"Expo Go"**.
3. Asegúrate de que tu teléfono esté conectado a la **misma red Wi-Fi** que tu computadora.

## 2. Iniciar el Servidor de Desarrollo
En la terminal de tu computadora (dentro de la carpeta del proyecto), ejecuta:

```bash
npx expo start
```

Verás un código QR grande en la terminal.

## 3. Ejecutar la App
1. Abre la app **Expo Go** en tu teléfono.
2. Toca la opción **"Scan QR code"** (Escanear código QR).
3. Apunta la cámara al código QR que aparece en tu terminal.

La aplicación comenzará a compilarse y se abrirá en tu teléfono.

## 4. Configuración de Permisos (Importante para S23 Ultra) 🛡️

Al abrir la app por primera vez, verás varias solicitudes de permisos. Para que la alarma funcione correctamente (especialmente con pantalla apagada), debes configurarlos así:

1. **Ubicación**:
   - Cuando pregunte, selecciona **"Mientras la app está en uso"**.
   - Luego, ve a **Ajustes > Aplicaciones > Expo Go > Permisos > Ubicación**.
   - Cambia el permiso a **"Permitir todo el tiempo"** (Allow all the time). *Esto es vital para el modo segundo plano.*

2. **Notificaciones**:
   - Permite las notificaciones para que la app pueda mostrar el aviso persistente de "Monitoreando ubicación".

3. **Batería (Opcional pero recomendado)**:
   - Los teléfonos Samsung son agresivos cerrando apps en segundo plano.
   - Ve a **Ajustes > Aplicaciones > Expo Go > Batería**.
   - Selecciona **"No restringido"** (Unrestricted).

## 💡 Solución de Problemas

- **Error de conexión**: Si Expo Go no conecta, intenta ejecutar `npx expo start --tunnel`. Esto es más lento pero funciona incluso si las redes Wi-Fi son diferentes o tienen firewall.
- **La alarma no suena**: Verifica que el volumen multimedia de tu teléfono esté alto y que no estés en modo "No Molestar" estricto.
