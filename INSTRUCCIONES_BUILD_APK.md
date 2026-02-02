# Cómo Generar y Probar tu APK

> [!IMPORTANT]
> **RECOMENDACIÓN:** Usa la **Construcción en la Nube (Cloud Build)**. Es más lenta (tarda unos minutos en cola) pero **infalible** porque no depende de que tengas Java/Android Studio instalados en tu Mac.

## 1. Generar APK de PRUEBA (Opción Recomendada: NUBE)

Ejecuta esto en tu terminal y espera a que termine. Te dará un link de descarga (QR) al final.

```bash
eas build -p android --profile preview
```

## 2. Opción Local (Solo si tienes Android Studio y Java configurados)
*El error que viste (`Unable to locate a Java Runtime`) significa que tu Mac no tiene Java configurado correctamente. Por eso falló.*

Si arreglas Java, puedes usar:
```bash
eas build -p android --profile preview --local
```

## 3. Generar AAB de PRODUCCIÓN (Para subir a Play Store)

Cuando todo esté probado y listo:

```bash
eas build -p android --profile production
```

## 4. Precios Confirmados (México)
*   **Mensual:** ~$99 MXN ($4.99 USD)
*   **Anual:** ~$799 MXN ($39.99 USD)

---
**Recursos Generados:**
Ya tienes los iconos y gráficos en la carpeta de artefactos.
