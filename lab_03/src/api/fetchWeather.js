const URL = '/api/weather';

export async function fetchWeather(query) {
  const params = new URLSearchParams({
    q: query.trim().toLowerCase(),
    units: 'metric',
    lang: 'pl',
  });

  let response;
  try {
    response = await fetch(`${URL}?${params}`);
  } catch {
    throw new Error('Brak połączenia z internetem.');
  }

  if (!response.ok) {
    if (response.status === 404) throw new Error('Nie znaleziono miasta.');
    if (response.status === 401) throw new Error('Nieprawidłowy lub nieaktywny klucz API.');
    throw new Error(`Błąd serwera pogody (${response.status}).`);
  }

  return response.json();
}
