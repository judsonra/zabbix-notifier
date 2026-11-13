# Zabbix Notifier

[English](README.md) · [Português (Brasil)](README.pt-BR.md) · **Español**

Extensión para Zabbix 7.0 en Chrome, Firefox, Opera, Vivaldi y Brave. La URL comienza en blanco; usted indica un token de API y un intervalo de consulta de 30, 45 o 60 segundos. No depende de un backend intermedio ni modifica datos en Zabbix. La interfaz está disponible en inglés, portugués (Brasil) y español.

📖 **Documentación:** [wiki del proyecto](https://github.com/judsonra/zabbix-notifier/wiki) (English, Português, Español).

## Instalar en Chrome

1. Abra `chrome://extensions` y active el modo de desarrollador.
2. Haga clic en **Cargar descomprimida** y seleccione la carpeta `chrome` de este proyecto.
3. Abra el icono de la extensión, indique una URL HTTPS, el token y el intervalo, y haga clic en **Probar y guardar conexión**.
4. Autorice el acceso al servidor indicado y permita las notificaciones en el sistema operativo.

## Instalar en Opera, Vivaldi o Brave

Los paquetes usan Manifest V3, con el mismo código de la versión para Chrome. Use versiones de escritorio actualizadas, con Chromium 120 o posterior.

| Navegador | Página de extensiones | Carpeta del proyecto | Paquete ZIP |
| --- | --- | --- | --- |
| Opera | `opera://extensions` | `opera` | `zabbix-notifier-opera.zip` |
| Vivaldi | `vivaldi://extensions` | `vivaldi` | `zabbix-notifier-vivaldi.zip` |
| Brave | `brave://extensions` | `brave` | `zabbix-notifier-brave.zip` |

1. Abra la página de extensiones del navegador y active el **Modo de desarrollador**.
2. Haga clic en **Cargar descomprimida** (o **Load unpacked**) y seleccione la carpeta correspondiente.
3. Si usa el ZIP, extráigalo primero y seleccione la carpeta que contiene `manifest.json`.
4. Abra la extensión, indique una URL HTTPS, el token y el intervalo, y haga clic en **Probar y guardar conexión**.
5. Autorice el acceso al servidor y permita las notificaciones en el sistema operativo.

La conexión y los permisos deben configurarse por separado en cada navegador. Los paquetes aún necesitan validación manual en estos navegadores con un servidor Zabbix real.

Referencias: [Opera](https://help.opera.com/en/extensions/testing/), [Vivaldi](https://help.vivaldi.com/desktop/appearance-customization/extensions/) y [Brave](https://support.brave.app/hc/en-us/articles/360017909112-How-can-I-add-extensions-to-Brave).

## Instalar en Firefox

1. Abra `about:debugging#/runtime/this-firefox`.
2. Haga clic en **Cargar complemento temporal** y seleccione `firefox/manifest.json`.
3. Configure la conexión desde el icono de la extensión.

La instalación temporal de Firefox termina al reiniciar el navegador. La instalación permanente y la distribución normal requieren la firma de Mozilla; el ZIP incluido aún no está firmado. Chrome requiere la versión 120 o posterior; Firefox, la 140 o posterior. Los ZIP son paquetes de distribución para revisión o publicación, sin credenciales.

## Uso

En **Configuración → Severidades de los problemas**, seleccione qué niveles entran en la consulta, la lista, el contador y las notificaciones. Las seis severidades vienen seleccionadas, también en conexiones antiguas. Debe mantenerse al menos una seleccionada. Los filtros se guardan automáticamente al marcar o desmarcar opciones, sin volver a escribir el token. El panel confirma el guardado o informa de cualquier fallo. Si intenta desmarcar la última severidad, la opción se mantiene seleccionada. Al cambiar el filtro, los problemas ya existentes no generan notificaciones retroactivas.

La barra de iconos contiene, en este orden:

- **Iniciar/detener verificaciones automáticas:** el cuadrado detiene las consultas periódicas; el triángulo las inicia de nuevo. La lista anterior permanece visible mientras está en pausa. Al iniciar, la extensión consulta la lista actual sin generar notificaciones retroactivas.
- **Actualizar ahora:** hace una consulta manual, incluso con las verificaciones automáticas en pausa, sin reactivarlas.
- **No molestar:** mantiene actualizadas las consultas, la lista y el contador, pero bloquea las nuevas notificaciones. Los eventos consultados durante el silencio se registran para no notificarse de nuevo cuando se desactive el modo. No elimina las notificaciones que el sistema ya mostró.
- **Configuración:** abre o cierra la conexión y el filtro de problemas suprimidos.

El estado de pausa y de no molestar se guarda localmente y se respeta al reabrir el panel o reiniciar el navegador. Los controles comienzan con las verificaciones activas y no molestar desactivado. Los iconos tienen descripción al pasar el ratón y nombres accesibles.

- Indique la URL de la interfaz web, incluido el subdirectorio cuando exista, como `https://servidor.ejemplo/zabbix/`. Ningún servidor viene rellenado.
- Use un token asociado a un usuario con acceso de lectura a los hosts y a las API `problem.get` y `trigger.get`. El monitoreo respeta los permisos de ese usuario.
- En **Configuración**, la opción **Mostrar problemas suprimidos** viene desmarcada, también en conexiones anteriores a la versión 1.0.1. Con este valor, la API excluye los problemas suprimidos; no aparecen en la lista, el contador ni las nuevas notificaciones. Al marcarla, la consulta incluye los suprimidos y la lista los identifica como **Suprimido**.
- Esta preferencia se guarda automáticamente al cambiarla, sin volver a escribir el token. **Probar y guardar conexión** también guarda la opción. Al guardar el filtro, la consulta establece una nueva referencia sin notificar los problemas ya existentes. Si la consulta falla, la lista anterior permanece marcada como posiblemente desactualizada hasta la siguiente consulta correcta.
- La primera consulta muestra los problemas existentes sin notificarlos. Las siguientes notifican los problemas nuevos. Cuando llegan varios juntos, una notificación resume el lote; la lista contiene todos.
- Haga clic en una notificación o en un elemento de la lista para abrir los detalles del evento. La interfaz web puede exigir su inicio de sesión habitual: el token de la extensión no autentica la sesión web.
- El contador muestra los problemas activos. `!` indica un fallo; la lista anterior permanece y se marca como posiblemente desactualizada.
- El navegador debe estar en ejecución. El intervalo es una programación solicitada, sin garantía de puntualidad: la suspensión, el ahorro de energía y las limitaciones del navegador pueden retrasar las consultas.
- Los eventos que aparezcan y se resuelvan entre consultas no se detectan, porque esta versión consulta solo problemas activos.
- El token se guarda en el almacenamiento local de la extensión, sin sincronización y sin cifrado adicional. **Desconectar y borrar token** elimina la conexión local; no revoca el token en el servidor. Los permisos de acceso ya concedidos pueden revocarse en la página de gestión de la extensión.
- Se exige HTTPS con un certificado de confianza. El token solo se envía a la API configurada; las redirecciones están bloqueadas. No hay telemetría ni bibliotecas externas.
- Al editar la conexión, indique de nuevo el token. Una conexión no válida no reemplaza la anterior.

## Idiomas

La extensión usa `chrome.i18n` (disponible también en Firefox como `browser.i18n`) y sigue el idioma del navegador. Idiomas disponibles: **portugués de Brasil** (`pt_BR`, el predeterminado), **inglés** (`en`) y **español** (`es`). Si el navegador está en otro idioma, la interfaz aparece en portugués de Brasil. Esto vale para el panel, las notificaciones, los mensajes de error y el nombre y la descripción de la extensión en la página de extensiones. Los mensajes de error devueltos por la propia API de Zabbix permanecen en el idioma del servidor.

Las traducciones están en `_locales/<idioma>/messages.json`. Para añadir un idioma, copie `_locales/en` a una carpeta nueva con el código del idioma (por ejemplo `fr`), traduzca el campo `message` de cada clave y añada el código a la lista `LOCALES` de `build-extension.py`. Los textos fijos del panel están en `popup.html` con los atributos `data-i18n`, `data-i18n-title` y `data-i18n-aria-label`, y los textos dinámicos usan `t('clave')`, de `src/i18n.ts`. Al añadir una clave, inclúyala en los tres idiomas.

## Actualización 1.0.6

La versión 1.0.6 añade soporte para varios idiomas (inglés, portugués de Brasil y español). Sus carpetas y ZIP están en `releases/1.0.6/`, en las subcarpetas `chrome`, `firefox`, `opera`, `vivaldi` y `brave`. Para actualizar una instalación sin comprimir, seleccione la carpeta de su navegador dentro de `releases/1.0.6/` o, si ya apunta a esa ruta, haga clic en **Recargar** en la página de extensiones. La conexión y las preferencias guardadas se mantienen.

Las carpetas `chrome`, `firefox`, `opera`, `vivaldi` y `brave` en la raíz del proyecto y los ZIP de la raíz siguen en versiones anteriores, y las versiones anteriores en `releases/` se conservaron.

## Iconos

Los iconos de la interfaz siguen el estilo **Lucide**, con las importaciones centralizadas en `src/icons.ts`, tamaño de 20 px y grosor 2. La biblioteca se incluye localmente en la compilación; solo los iconos utilizados entran en el paquete. La licencia está en `LICENSE-lucide.txt`. La convención también está registrada en la skill personal `lucide-icons`.

## Desarrollo y validación

Los fuentes TypeScript están en `src/`: `types.ts` define los datos y mensajes, `platform.ts` concentra la API de extensiones y el almacenamiento, `i18n.ts` proporciona los textos traducidos, `core.ts` valida configuraciones y enlaces, `background.ts` ejecuta el monitoreo y `popup.ts` controla el panel. Los archivos `core.js`, `background.js` y `popup.js` de la raíz se generan automáticamente; edite los archivos TypeScript.

Instale las dependencias de desarrollo con `npm ci`. Ejecute `npm run build` para validar los tipos en modo estricto y compilar los scripts para los navegadores. Ejecute `npm test` para compilar y ejecutar las pruebas TypeScript de `tests/notifier.test.ts`. El script de compilación está en `scripts/build.ts`; las dependencias y versiones exactas están en `package-lock.json`.

`npm run package:extensions` compila y genera los cinco paquetes en un nuevo directorio `releases/1.0.6`. Los navegadores ejecutan solo el JavaScript compilado, sin dependencias externas en tiempo de ejecución. `python3 build-extension.py` genera las carpetas `chrome` y `firefox` y sus ZIP, incluido `_locales`. Para seleccionar los navegadores, use:

```sh
python3 build-extension.py --browsers opera vivaldi brave
```

Para generar los cinco en una copia nueva del proyecto, use `python3 build-extension.py --browsers chrome firefox opera vivaldi brave`. Para preservar los archivos, el generador rechaza destinos existentes; para otra generación use una copia nueva de los fuentes en un directorio vacío.

Para generar en un directorio nuevo sin reemplazar paquetes existentes, use `python3 build-extension.py --browsers chrome firefox opera vivaldi brave --output-dir releases/1.0.6`.

Ejecute `npm test` para probar configuración, enlaces, polling, filtro de suprimidos, pausa, no molestar, deduplicación y fallos de red con API simuladas. El comando antiguo `node test-notifier.cjs` también redirige a esa suite. Estas pruebas no sustituyen la validación en el navegador y en el servidor real.

Documentación: [API de Zabbix 7.0](https://www.zabbix.com/documentation/7.0/en/manual/api), [alarms en Chrome](https://developer.chrome.com/docs/extensions/reference/api/alarms), [background en Chrome/Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background).

## Licencia

Distribuido bajo la [Licencia MIT](LICENSE). Los iconos Lucide se distribuyen bajo sus propias licencias (ISC y MIT), en [LICENSE-lucide.txt](LICENSE-lucide.txt).

Zabbix Notifier es un proyecto independiente, no afiliado ni respaldado por Zabbix SIA. Zabbix es una marca registrada de Zabbix SIA.
