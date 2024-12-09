# Proyecto de Final Simulación 3D con Three.js

# Mejoras Agregadas al Proyecto

## Nuevas Funcionalidades

1. **Soporte para Sombras**:
   - Activación de sombras suaves con `PCFSoftShadowMap`.
   - Configuración de luces y materiales para proyectar y recibir sombras.

2. **Luz Debajo del Vehículo**:
   - Luz puntual (`PointLight`) colocada debajo del vehículo para simular un faro.
   - Control para encender/apagar la luz con la tecla `L`.
   - Opción de cambiar el color de la luz con la tecla `C`.

3. **Sistema de Explosiones**:
   - Sistema de partículas para simular explosiones al destruir obstáculos.
   - Luz puntual breve que acompaña las explosiones para mayor realismo.

4. **Materiales Avanzados**:
   - Sustitución de `MeshBasicMaterial` por `MeshStandardMaterial` para permitir interacción con luces y sombras.
   - Uso de texturas y propiedades como `roughness` y `metalness` para mejorar la apariencia.
  
  ### Integrantes
- Nombre: Henry Galue  
  Carnet: 14-10373  
  API: Three.js  

---

### Sistema Operativo de Desarrollo
- **Sistema Operativo:** Windows 10

---

### Dependencias
- **Three.js:** Incluido en el repositorio (`three.module.js`).
- **Navegador Web:** Chrome, Firefox o Edge (compatibles con WebGL).

---

## Cómo Correr la Simulación

1. Si has instalado `http-server`, corre el servidor en el directorio raíz del proyecto:
    ```bash
    http-server .
    ```
    Luego, abre tu navegador y navega a `http://localhost:8080` (o el puerto que indique el servidor).


