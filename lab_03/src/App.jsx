import { useEffect, useState } from 'react';
import { fetchWeather } from './api/fetchWeather.js';
import './App.css';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function compass(deg) {
  return DIRECTIONS[Math.round(deg / 45) % DIRECTIONS.length];
}

function formatTime(seconds) {
  return new Date(seconds * 1000).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeather(query);
      setWeather(data);
      setQuery('');
    } catch (err) {
      setWeather(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <form onSubmit={search}>
        <input
          type="text"
          className="search"
          placeholder="Wpisz miasto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {!online && <p className="message error">Brak połączenia — pokazuję ostatnio pobrane dane.</p>}
      {loading && <p className="message">Pobieranie danych...</p>}
      {error && <p className="message error">{error}</p>}

      {weather && (
        <div className="city">
          <h2 className="city-name">
            <span>{weather.name}</span>
            <sup>{weather.sys.country}</sup>
          </h2>
          <div className="city-temp">
            {Math.round(weather.main.temp)}
            <sup>&deg;C</sup>
          </div>
          <div className="info">
            <img
              className="city-icon"
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <p>{weather.weather[0].description}</p>
          </div>
          <div className="details">
            <p>Ciśnienie: {weather.main.pressure} hPa</p>
            <p>Wilgotność: {weather.main.humidity}%</p>
            <p>
              Wiatr: {weather.wind.speed} m/s
              {weather.wind.gust !== undefined && `, porywy ${weather.wind.gust} m/s`}
            </p>
            <p>
              Kierunek wiatru: {weather.wind.deg}&deg; ({compass(weather.wind.deg)})
            </p>
            <p>Pomiar z godz. {formatTime(weather.dt)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
