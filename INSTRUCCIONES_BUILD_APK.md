# Cómo Construir el APK Corregido

## Opción 1: Build en la Nube (Recomendado)

```bash
cd /Users/usuario/Developer/Despiertame
npx eas-cli build --profile preview --platform android
```

Esto construirá el APK en los servidores de Expo y te dará un link para descargarlo cuando termine.

## Opción 2: Build Local (Requiere Docker)

```bash
cd /Users/usuario/Developer/Despiertame
npx eas-cli build --profile preview --platform android --local
```

## Después de Construir

### Instalar el APK
```bash
# Conecta tu dispositivo Android
adb devices

# Instala el APK
adb install ruta/al/archivo.apk
```

### Verificar que Funciona
```bash
# Limpiar logs anteriores
adb logcat -c

# Monitorear logs mientras abres la app
adb logcat | grep -i "despiertame\|ReactNative\|FATAL\|AndroidRuntime"
```

## Qué Esperar

1. ✅ La app debería abrir inmediatamente
2. ✅ Debería pedir permisos de ubicación
3. ✅ El mapa debería mostrarse con tu ubicación actual
4. ✅ Deberías poder buscar destinos y activar el tracking

## Si Hay Problemas

Los logs ahora mostrarán errores específicos gracias al manejo de errores que agregamos. Comparte los logs conmigo y podré ayudarte a diagnosticar cualquier problema restante.
