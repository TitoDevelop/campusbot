// Alumno: Jose Luis Mas García
// Práctica: Asistentes Conversacionales - CampusBot
// Webhook de Fulfillment para Dialogflow ES.
// Consulta Open-Meteo para obtener una previsión meteorológica.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return response(405, { fulfillmentText: 'Método no permitido.' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const parameters = body.queryResult?.parameters || {};

    const ciudad = String(parameters.ciudad || parameters['geo-city'] || '').trim();
    const fecha = normalizarFecha(parameters.fecha || parameters.date);

    if (!ciudad) {
      return response(200, { fulfillmentText: 'No he podido identificar la ciudad.' });
    }

    if (!fecha) {
      return response(200, { fulfillmentText: 'No he podido identificar la fecha.' });
    }

    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.searchParams.set('name', ciudad);
    geoUrl.searchParams.set('count', '1');
    geoUrl.searchParams.set('language', 'es');
    geoUrl.searchParams.set('format', 'json');

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error('Error en geocodificación');
    const geo = await geoRes.json();
    const lugar = geo.results?.[0];

    if (!lugar) {
      return response(200, { fulfillmentText: `No he encontrado la ciudad ${ciudad}.` });
    }

    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.searchParams.set('latitude', String(lugar.latitude));
    forecastUrl.searchParams.set('longitude', String(lugar.longitude));
    forecastUrl.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
    forecastUrl.searchParams.set('timezone', lugar.timezone || 'auto');
    forecastUrl.searchParams.set('start_date', fecha);
    forecastUrl.searchParams.set('end_date', fecha);

    const weatherRes = await fetch(forecastUrl);
    if (!weatherRes.ok) throw new Error('Error en Open-Meteo');
    const weather = await weatherRes.json();

    const daily = weather.daily;
    if (!daily?.time?.length) {
      return response(200, { fulfillmentText: `No hay previsión disponible para ${ciudad} en esa fecha.` });
    }

    const max = daily.temperature_2m_max?.[0];
    const min = daily.temperature_2m_min?.[0];
    const lluvia = daily.precipitation_probability_max?.[0];
    const codigo = daily.weather_code?.[0];
    const descripcion = describirCodigo(codigo);
    const nombreLugar = lugar.name || ciudad;

    const mensaje = `Para ${nombreLugar} el ${fecha}, la previsión es ${descripcion}. ` +
      `Temperatura máxima de ${max} °C y mínima de ${min} °C. ` +
      `Probabilidad máxima de precipitación: ${lluvia ?? 0}%.`;

    return response(200, {
      fulfillmentText: mensaje,
      source: 'campusbot-netlify-openmeteo'
    });
  } catch (error) {
    console.error('Error weather-webhook:', error);
    return response(200, {
      fulfillmentText: 'Se ha producido un error al consultar el servicio meteorológico.'
    });
  }
};

function normalizarFecha(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value.startDate) return String(value.startDate).slice(0, 10);
  return '';
}

function describirCodigo(code) {
  const textos = {
    0: 'cielo despejado',
    1: 'principalmente despejado',
    2: 'parcialmente nuboso',
    3: 'cubierto',
    45: 'niebla', 48: 'niebla con escarcha',
    51: 'llovizna débil', 53: 'llovizna moderada', 55: 'llovizna intensa',
    61: 'lluvia débil', 63: 'lluvia moderada', 65: 'lluvia intensa',
    71: 'nieve débil', 73: 'nieve moderada', 75: 'nieve intensa',
    80: 'chubascos débiles', 81: 'chubascos moderados', 82: 'chubascos fuertes',
    95: 'tormenta', 96: 'tormenta con granizo', 99: 'tormenta fuerte con granizo'
  };
  return textos[code] || 'condiciones variables';
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  };
}
