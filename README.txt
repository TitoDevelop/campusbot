CAMPUSBOT - NETLIFY
===================

1. Sube esta carpeta a un repositorio de GitHub.
2. En Netlify: Add new project > Import an existing project > GitHub.
3. Selecciona el repositorio. Netlify leerá netlify.toml automáticamente.
4. Antes de probar el chat, añade estas variables en:
   Site configuration > Environment variables

   DIALOGFLOW_PROJECT_ID
   DIALOGFLOW_CLIENT_EMAIL
   DIALOGFLOW_PRIVATE_KEY

5. Los tres valores se obtienen del JSON de una cuenta de servicio de Google Cloud.
   NO subas ese JSON a GitHub.

6. Haz Deploy. Al terminar tendrás una URL similar a:
   https://campusbot-xxxxx.netlify.app

Esa URL es la que puedes poner en la entrega.

PRUEBAS RECOMENDADAS
- ¿Qué puedes hacer?
- Háblame de ti
- Quiero organizar una sesión de estudio
- Adiós

NOTA
La consulta del tiempo necesita además que el intent tiempo.consultar tenga configurado su webhook/API externa en Dialogflow.
