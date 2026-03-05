# Landing demo producto + widget ElevenLabs

## Arranque rapido

1. Instala dependencias:
   - `npm.cmd install`
2. Rellena las variables necesarias en `.env`.
3. Ejecuta:
   - `npm run dev`
4. Abre `http://localhost:5173` y haz login para entrar a la landing.

## Variables que debes completar

- `VITE_ELEVENLABS_AGENT_ID` (si usas agente publico sin auth)
- `VITE_ELEVENLABS_SIGNED_URL` (alternativa segura; usa una u otra)
- `VITE_ELEVENLABS_OVERRIDE_VOICE_ID` (opcional)
- `VITE_ELEVENLABS_OVERRIDE_PROMPT` (opcional)
- `VITE_ELEVENLABS_AVATAR_IMAGE_URL` (URL de la mujer animada para el icono)
- `VITE_PRODUCT_IMAGE_URL` (foto principal del producto)
- `VITE_BRAND_LOGO_URL` (logo de marca/cabecera)
- `VITE_LOGIN_USERNAME` (usuario fijo para login demo)
- `VITE_LOGIN_PASSWORD` (contrasena fija para login demo)

Para evitar fallos de carga, guarda las imagenes en `public/images` y usa rutas:
- `/images/198797.webp`
- `/images/logo_perfumesclub.png`

## Datos que ya se envian al agente

Se mandan en `dynamic-variables`:

- `user_name` = `Krystian` (desde `VITE_USER_NAME`)
- `brand` = `Clarins` (desde `VITE_PRODUCT_BRAND`)
- `item_id` = `68580` (desde `VITE_PRODUCT_ITEM_ID`)
- `selected_size` (segun el tamano elegido)
- `selected_price` (segun el tamano elegido)

## Notas importantes de ElevenLabs

- El widget embebido requiere configuracion valida del agente.
- Si usas `agent-id`, asegúrate de tener el agente listo para widget.
- Si usas `signed-url`, se prioriza sobre `agent-id`.

## Si PowerShell bloquea npm

Si te aparece el error de `npm.ps1` por execution policy, usa:

- `npm.cmd install`
- `npm.cmd run dev`

Alternativa (solo usuario actual):

- `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
