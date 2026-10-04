# Configuración de Dialogflow - CampusBot
**Alumno:** Jose Luis Mas García

1. Importar `dialogflow/Jose_Luis_Mas_Garcia_CampusBot_Dialogflow.zip` desde **Settings > Export and Import > Import from ZIP**.
2. En **Fulfillment**, activar Webhook.
3. URL del webhook:
   `https://campusbotua.netlify.app/.netlify/functions/weather-webhook`
4. Abrir el intent `tiempo.consultar` y comprobar que está activado **Enable webhook call for this intent**.
5. El intent utiliza los parámetros obligatorios:
   - `ciudad` -> `@sys.geo-city`
   - `fecha` -> `@sys.date`
6. Probar: `¿Qué tiempo hará mañana en Alicante?`

El webhook recibe el JSON de Dialogflow, extrae `ciudad` y `fecha`, consulta Open-Meteo y devuelve un JSON con `fulfillmentText`.
