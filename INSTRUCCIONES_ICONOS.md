# Instrucciones para Crear Iconos Llamativos

## Diseño Recomendado

**Concepto**: Alarma moderna con pin de ubicación

**Colores vibrantes**:
- Gradiente de azul eléctrico (#00D4FF) a púrpura vibrante (#9D00FF)
- O alternativamente: Gradiente de naranja (#FF6B00) a rosa (#FF0080)

**Elementos**:
- Reloj despertador estilizado con campanas sonando
- Pin de ubicación integrado en el diseño
- Líneas de movimiento para indicar vibración/sonido
- Estilo moderno, flat design con sombras largas

## Opción 1: Usar Generador Online

Puedes usar herramientas como:
- **Canva**: https://www.canva.com/create/app-icons/
- **Figma**: Diseño personalizado
- **Icon Kitchen**: https://icon.kitchen/

## Opción 2: Usar el Generador HTML Incluido

Ya tienes un generador de iconos en:
```
/Users/usuario/Developer/Despiertame/assets/generator.html
```

Ábrelo en tu navegador y personaliza los colores y diseño.

## Especificaciones Técnicas

### Icono Principal (icon.png)
- Tamaño: 1024x1024 px
- Formato: PNG
- Fondo: Sólido o gradiente
- Ubicación: `/Users/usuario/Developer/Despiertame/assets/icon.png`

### Adaptive Icon (Android)
- Tamaño: 1024x1024 px
- Formato: PNG con transparencia
- Los elementos deben estar en el centro (safe zone: 66% del canvas)
- Ubicación: `/Users/usuario/Developer/Despiertame/assets/adaptive-icon.png`

### Splash Screen
- Tamaño: 1284x2778 px (opcional, puede ser el mismo diseño escalado)
- Ubicación: `/Users/usuario/Developer/Despiertame/assets/splash.png`

## Después de Crear los Iconos

1. Guarda los archivos en la carpeta `assets/`
2. Reconstruye el APK:
   ```bash
   npx eas-cli build --profile preview --platform android
   ```

## Paleta de Colores Sugerida

**Opción 1 - Azul/Púrpura** (Moderno, tecnológico):
- Primario: #00D4FF
- Secundario: #9D00FF
- Acento: #FFFFFF

**Opción 2 - Naranja/Rosa** (Energético, llamativo):
- Primario: #FF6B00
- Secundario: #FF0080
- Acento: #FFFFFF

**Opción 3 - Verde/Amarillo** (Fresco, despertador):
- Primario: #00FF88
- Secundario: #FFD700
- Acento: #FFFFFF
