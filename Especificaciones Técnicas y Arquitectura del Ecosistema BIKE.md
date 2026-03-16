\# Especificaciones Técnicas BIKE

Este es el documento de especificaciones técnicas para la plataforma \*\*"BIKE"\*\*, diseñado a partir de las mejores prácticas y arquitecturas disponibles para el control vehicular, el desarrollo de aplicaciones web/móviles y el uso de inteligencia artificial.

\#\# 1\. Visión General  
La plataforma \*\*BIKE\*\* será un sistema avanzado de gestión y control vehicular diseñado para administrar el padrón vehicular, las asignaciones (resguardos), el control de combustible y los mantenimientos de una flotilla \[1\]. El sistema se compondrá de una aplicación web administrativa y una aplicación móvil para los conductores, operando bajo una arquitectura escalable y tolerante a fallos.

\#\# 2\. Arquitectura del Sistema  
El sistema utilizará una arquitectura multicapa distribuida para garantizar agilidad y modularidad:

\*   \*\*Backend y Base de Datos:\*\* La lógica del servidor se basará en el \*\*patrón de diseño Modelo-Vista-Controlador (MVC)\*\*, que permite separar la información, la lógica del sistema y la interfaz \[2, 3\]. Se utilizará el framework \*\*Laravel 8.0\*\* basado en \*\*PHP 7.4.22\*\* \[4, 5\]. Como Sistema Gestor de Base de Datos relacional se empleará \*\*MySQL\*\*, interactuando mediante el mapeador relacional de objetos (ORM) de Laravel \[6, 7\].  
\*   \*\*Aplicación Web (PWA):\*\* El frontend web, diseñado con plantillas como \*\*AdminLTE3\*\* basadas en \*\*Bootstrap 4.6\*\* \[5, 8\], integrará \*\*Push API\*\* y \*\*API de notificaciones\*\* gestionadas por un \*Service Worker\* \[9\]. Esto permitirá entregar contenido nuevo automáticamente, volver a conectar la aplicación y mostrar alertas al usuario incluso cuando la página esté cerrada \[10, 11\].  
\*   \*\*Aplicación Móvil (Offline-First):\*\* La app para conductores utilizará una arquitectura \*Offline-First\* \[12\].   
    \*   Se utilizará \*\*GetX\*\* para la gestión reactiva del estado y las actualizaciones de la interfaz de usuario \[13\].   
    \*   Los datos de red se guardarán localmente usando \*\*SQLite\*\*, lo que permitirá operar y consultar datos sin depender de una conexión estable \[12, 14\].  
    \*   Se implementará compresión de imágenes nativa en el dispositivo usando \*\*react-native-compressor\*\*, ajustando los parámetros a una calidad de \`0.8\` y un ancho máximo de \`1080\` \[15, 16\]. Esto optimiza el tamaño de la imagen reduciéndolo entre un 80% y 90%, mejorando drásticamente los tiempos de subida a la API \[17, 18\]. Además, las imágenes comprimidas pueden ser almacenadas como blobs binarios en crudo directamente en la base de datos local SQLite para acceso rápido \[19\].

\#\# 3\. Captura de Datos con Inteligencia Artificial (OCR)  
Para el registro de métricas y lecturas de los vehículos, la plataforma usará procesamiento de imágenes:

\*   \*\*Captura de Odómetro:\*\* Se usará la cámara del smartphone para escanear el odómetro y registrar automáticamente el kilometraje \[20\].  
\*   \*\*Motores OCR Soportados:\*\* Se podrá emplear \*\*Google ML Kit Text Recognition v2\*\*, el cual soporta el análisis de la estructura del texto dividiéndolo en bloques, líneas, elementos y símbolos \[21, 22\]. Como alternativa para operaciones sin conexión a internet, se integrará el \*\*SDK de Anyline\*\*, ideal para capturar medidores analógicos, digitales o de dial y cumplir con las normativas de protección de datos como el RGPD \[23-25\]. Si se opta por usar \*\*Tesseract OCR\*\* para extraer números simples, la configuración del \*Page Segmentation Mode\* debe fijarse en \`--psm 7\` en lugar de \`--psm 8\`, ya que este último tiende a generar errores de lectura en números simples separados por espacios \[26, 27\].  
\*   \*\*Estructura y Validación de Datos:\*\* El registro del mantenimiento o combustible tendrá el siguiente flujo de validación \[28\]:  
    1\.  \*\*Kilometraje:\*\* Método de entrada vía \*OCR (Cámara) / Manual\*. \*\*Validación:\*\* El valor debe ser estrictamente \`\> KM anterior\` \[28\].  
    2\.  \*\*Imagen de Soporte:\*\* Foto de la factura o tablero. \*\*Validación:\*\* Obligatorio para categorías tipo "Elite Class" \[28\].  
    3\.  \*\*Timestamp:\*\* Método de entrada automático (GPS/Red). \*\*Validación:\*\* Fecha y hora exacta del registro \[28\].  
\*   \*\*Confidence Scores y Degradación Elegante:\*\* Al procesar información mediante OCR o IA, el sistema evaluará puntuaciones de confianza como el \`ocrConfidence\` \[29\]. Para lidiar con los fallos predecibles de la IA, se aplicarán estrategias de degradación elegante (\*Graceful Degradation\*) \[30, 31\]: si el nivel de confianza es bajo (por ejemplo, \<60%), la UI mostrará advertencias visuales (como bordes punteados o colores amarillos/rojos) y solicitará al usuario que clarifique o confirme la información manualmente \[32, 33\].

\#\# 4\. Analítica y Gestión de Tareas Core  
\*   \*\*Predicción de Mantenimiento mediante CBR:\*\* Para pronosticar cuándo se debe reparar nuevamente el automóvil basándose en historias previas, se usará el \*\*Razonamiento Basado en Casos (CBR)\*\* \[34, 35\]. Utilizando el \*algoritmo ID3\*, el sistema creará un árbol de decisión comparando características como: marca, modelo, tipo de motor, tracción, combustible y año del automóvil \[35, 36\]. Esto arrojará predicciones precisas de la vida útil en días o kilometraje restante para el mantenimiento \[37\].  
\*   \*\*Cálculo de Consumo de Combustible:\*\* Para medir la eficiencia de la flotilla, los reportes se calcularán bajo la fórmula estándar: \`Consumo (L/100 km) \= (Litros Utilizados X 100\) / Kilómetros Recorridos\` \[38\].  
\*   \*\*Generación de Reportes PDF:\*\* Se utilizará la librería \*\*DomPDF\*\*, que convierte el código HTML/CSS en archivos PDF descargables para generar documentos de uso rudo como formatos de resguardo, liberación de vehículos y la "Carta Resguardo y Responsiva" \[39-41\].

\#\# 5\. Infraestructura Cloud y Almacenamiento  
\*   \*\*Archivado de Logs:\*\* Los historiales transaccionales serán preservados a largo plazo en las clases de almacenamiento de \*\*Amazon S3 Glacier\*\* por su bajo costo \[42\].  
\*   \*\*Optimización de Costos de Transición:\*\* Para evitar un elevado costo por millones de transiciones de archivos pequeños a Glacier, se implementará una arquitectura basada en \*\*Amazon SQS\*\* \[43, 44\]. Un componente \*Productor\* agrupará los lotes, mientras que el \*Consumidor\* los leerá, comprimiéndolos en un único archivo \`tar.gz\` antes de enviarlos a S3 Glacier, lo que minimizará de manera drástica los costos de transición al procesar objetos más grandes en lugar de millones de archivos ligeros \[45, 46\].

\#\# 6\. Directrices de UI / UX  
El diseño se alinea con las tendencias del 2026 para garantizar interfaces modernas, accesibles y optimizadas:  
\*   \*\*Dark Mode UX:\*\* Implementar un modo oscuro ahorrará energía significativamente en los dispositivos con pantallas OLED y reducirá la fatiga visual \[47, 48\]. Se prohíbe el uso de negro puro (\`\#000000\`); en su lugar, se preferirán grises oscuros o azul marino para fondos, cuidando mantener un contraste mínimo de texto de 4.5:1 para cumplir con los estándares de accesibilidad WCAG \[49\].  
\*   \*\*Estética Visual y Animaciones:\*\* Se incorporará \*\*Glassmorfismo\*\* (efectos de transparencia y desenfoque) y pautas visuales de \*\*Material 3 Expressive\*\* para aportar modernidad \[50, 51\]. Mediante \*\*Tailwind CSS\*\*, se añadirán bordes dinámicos animados implementando una propiedad CSS personalizada \`@property\` en conjunto con el degradado circular \`conic-gradient\` \[52, 53\].  
\*   \*\*Tipografía de la Interfaz:\*\* Para mantener el dinamismo visual propio de las temáticas automotrices y deportivas, se recomiendan familias tipográficas de estilo fuerte, modernas o de aspecto industrial. Fuentes sugeridas: \*\*Prohibition\*\*, \*\*LTC Optic\*\* (Optic Gothic), \*\*Magistral\*\*, \*\*Macilla\*\*, \*\*Chakra Petch\*\* o \*\*Stretch Pro\*\* \[54-59\].  
