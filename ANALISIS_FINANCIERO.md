# Análisis Financiero: Despiértame (Modelo Freemium)

Este análisis proyecta la viabilidad financiera de la app basándose en el modelo actual:
- **Usuario Promedio**: 2 viajes diarios (1 gratis + 1 con anuncio).
- **Monetización**: 1 Video Recompensado (15s) + 4 Impresiones de Banner diarios.
- **Costos**: Google Places API (Búsqueda) + Google Maps SDK (Visualización).

> [!WARNING]
> **ALERTA CRÍTICA**: El análisis revela que el costo de la API de Google Places supera significativamente los ingresos por publicidad por usuario. El modelo actual genera pérdidas a escala.

---

## 1. Economía Unitaria (Por Usuario Activo Diario)

### 💰 Ingresos Estimados (LatAm / España)
Basado en eCPM (Costo por mil impresiones) promedio para la región.

| Formato | eCPM Estimado | Impresiones/Día | Ingreso Diario |
|---------|---------------|-----------------|----------------|
| **Video Recompensado** | $3.00 USD | 1 | $0.0030 |
| **Banner** | $0.30 USD | 4 | $0.0012 |
| **TOTAL INGRESOS** | | | **$0.0042 USD** |

### 💸 Costos Estimados (Google Maps Platform)
El costo principal es la búsqueda de destinos (`Places API`).
*Asumiendo 2 búsquedas diarias.*

| Servicio | Costo por 1000 | Uso Diario | Costo Diario |
|----------|----------------|------------|--------------|
| **Places Autocomplete** | $17.00 USD | 2 sesiones | $0.0340 |
| **Place Details** | $17.00 USD | 2 solicitudes | $0.0340 |
| **Maps SDK (Mobile)** | $0.00 (Gratis) | Ilimitado | $0.0000 |
| **TOTAL COSTOS** | | | **$0.0680 USD** |

### 📉 Balance Diario por Usuario
- **Ingreso**: $0.0042
- **Costo**: $0.0680
- **Pérdida Neta**: **-$0.0638 USD por usuario al día**

---

## 2. Proyección a Escala (Mensual)

Google ofrece un crédito mensual gratuito de **$200 USD**.

| Usuarios Activos | Ingresos Ads (Mes) | Costo API (Mes) | Crédito Google | **Beneficio/Pérdida Neta** |
|------------------|--------------------|-----------------|----------------|----------------------------|
| **10** | $1.26 | $20.40 | -$20.40 (Cubierto) | **+$1.26** (Rentable) |
| **100** | $12.60 | $204.00 | -$200.00 | **+$8.60** (Marginal) |
| **1,000** | $126.00 | $2,040.00 | -$200.00 | **-$1,714.00** (Pérdida) |
| **10,000** | $1,260.00 | $20,400.00 | -$200.00 | **-$19,340.00** (Pérdida) |
| **100,000** | $12,600.00 | $204,000.00 | -$200.00 | **-$191,600.00** (Pérdida) |

---

## 3. Conclusión y Recomendaciones Urgentes

**El modelo actual es insostenible.** Estás pagando ~$0.07 USD por usuario para ganar ~$0.004 USD. Cuantos más usuarios tengas, más dinero perderás.

### 🚀 Soluciones para Rentabilidad

#### A. Cambiar Proveedor de Mapas (Recomendado)
Migrar la búsqueda y mapas a **OpenStreetMap** o **Mapbox**.
- **Costo**: Gratis o fracción del costo de Google.
- **Impacto**: Convierte la pérdida de -$19k en ganancia de +$1.2k (con 10k usuarios).

#### B. Limitar Google Places a Premium
- **Usuarios Free**: Solo pueden seleccionar destino "pinzando" en el mapa (Geocoding inverso es más barato o gratis en otras plataformas) o usando una lista de "Favoritos" guardados localmente.
- **Usuarios Premium**: Acceso a la búsqueda predictiva de Google Places.

#### C. Optimización Agresiva
- Implementar **Session Tokens** estrictamente (ya lo hace la librería, pero verificar).
- Reducir la llamada a `fetchDetails`. Solo obtener coordenadas básicas.
- Cachear destinos frecuentes localmente.

### Escenario Corregido (Usando OpenStreetMap/Mapbox Free Tier)

Si eliminamos el costo de búsqueda:

| Usuarios | Ingresos (Mes) | Costo Servidor | **Beneficio Neto** |
|----------|----------------|----------------|--------------------|
| **1,000** | $126.00 | ~$10.00 | **+$116.00** |
| **10,000** | $1,260.00 | ~$50.00 | **+$1,210.00** |
| **100,000** | $12,600.00 | ~$200.00 | **+$12,400.00** |
| **1M** | $126,000.00 | ~$1,000.00 | **+$125,000.00** |

### Resumen
Para ser millonario con esta app, **DEBES dejar de usar Google Places API para usuarios gratuitos**.
