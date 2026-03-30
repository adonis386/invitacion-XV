# Invitación web (XV)

## Cómo abrir

- Abre `index.html` en tu navegador.
- Si quieres un servidor local (recomendado):

```powershell
cd C:\Users\USER\Documents\invitation
python -m http.server 5173
```

Luego abre `http://localhost:5173`.

## Personalización rápida

Edita `app.js` al inicio, en el objeto `INVITE`:

- `celebrantName`
- `dateISO`, `startTime24h`, `endTime24h`
- `venueShort`, `venueFull`, `address`
- `googleMapsUrl`
- `whatsappNumberE164`

Las fotos están en `img/` y la portada se puede cambiar en `index.html` (imagen principal y miniaturas).

