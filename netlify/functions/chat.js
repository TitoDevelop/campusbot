// Alumno: Jose Luis Mas García
// Práctica: Asistentes Conversacionales - CampusBot
const dialogflow = require('@google-cloud/dialogflow');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  try {
    const { text = '', sessionId = 'web-user' } = JSON.parse(event.body || '{}');
    const message = String(text).trim();
    if (!message) return { statusCode: 400, body: JSON.stringify({ error: 'Mensaje vacío' }) };

    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL;
    const privateKey = (process.env.DIALOGFLOW_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Faltan variables de Dialogflow en Netlify' }) };
    }

    const sessionClient = new dialogflow.SessionsClient({
      projectId,
      credentials: { client_email: clientEmail, private_key: privateKey }
    });

    const sessionPath = sessionClient.projectAgentSessionPath(projectId, String(sessionId));
    const [response] = await sessionClient.detectIntent({
      session: sessionPath,
      queryInput: { text: { text: message, languageCode: 'es' } }
    });

    const result = response.queryResult;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reply: result.fulfillmentText || 'No tengo una respuesta para eso.',
        intent: result.intent ? result.intent.displayName : null
      })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: 'No se pudo conectar con Dialogflow' }) };
  }
};
