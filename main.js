 function addPeelEffect(elem) {
    elem.addEventListener('mouseenter', () => {
      elem.classList.add('hovered');
    });
    elem.addEventListener('animationend', () => {
      elem.classList.remove('hovered');
    });
  }

  document.querySelectorAll('button').forEach(addPeelEffect);

  const dashboard = document.querySelector('.dashboard');
  const searchInput = document.querySelector('.filters input');
  const searchBtn = document.getElementById('searchBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const filterButtons = document.querySelectorAll('.filters button[data-filter]');

  const apiKey = 'be5b0e4ffa1bc4aa64d5b19be31fe1a3';

  // Default cities shown on load
  const defaultCities = [
    { name: "delhi", country: "in" },
    { name: "mumbai", country: "in" },
    { name: "Tokyo", country: "JP" },
    { name: "Moscow", country: "RU" },
    { name: "Sydney", country: "AU" },
    { name: "Dubai", country: "AE" },
    { name: "Paris", country: "FR" },
    { name: "Seattle", country: "US" },
  ];

  const weatherIcons = {
    Clear: '☀️',
    Clouds: '🌥',
    Rain: '🌧',
    Snow: '❄️',
    Thunderstorm: '🌩',
    Drizzle: '🌦',
    Mist: '🌫️',
    Smoke: '🌫️',
    Haze: '🌫️',
    Dust: '🌫️',
    Fog: '🌫️',
    Sand: '🌫️',
    Ash: '🌋',
    Squall: '🌪️',
    Tornado: '🌪️',
  };

  // Cache for fetched weather data to avoid multiple API calls
  const weatherCache = new Map();

  async function fetchWeather(city) {
    if (weatherCache.has(city.toLowerCase())) {
      return weatherCache.get(city.toLowerCase());
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`City "${city}" not found`);
    }
    const data = await res.json();
    weatherCache.set(city.toLowerCase(), data);
    return data;
  }

  function createCard(data) {
    const weatherMain = data.weather[0].main;
    const weatherDesc = data.weather[0].description;
    const icon = weatherIcons[weatherMain] || '🌈';
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6);
    const pressure = data.main.pressure;
    const visibility = data.visibility ? Math.round(data.visibility / 1000) : '-';

    let hoverColor, shineColor, borderColor;
    switch (weatherMain) {
      case 'Clear':
        hoverColor = 'rgba(255, 240, 150, 0.25)';
        shineColor = 'rgba(255, 255, 200, 0.8)';
        borderColor = 'rgba(255, 200, 0, 0.8)';
        break;
      case 'Clouds':
        hoverColor = 'rgba(120, 170, 255, 0.25)';
        shineColor = 'rgba(200, 200, 255, 0.8)';
        borderColor = 'rgba(100, 149, 237, 0.8)';
        break;
      case 'Rain':
      case 'Drizzle':
        hoverColor = 'rgba(100, 190, 240, 0.25)';
        shineColor = 'rgba(173, 216, 230, 0.8)';
        borderColor = 'rgba(64, 164, 223, 0.8)';
        break;
      case 'Thunderstorm':
        hoverColor = 'rgba(160, 0, 160, 0.25)';
        shineColor = 'rgba(200, 100, 200, 0.8)';
        borderColor = 'rgba(128, 0, 128, 0.8)';
        break;
      case 'Snow':
        hoverColor = 'rgba(200, 230, 255, 0.25)';
        shineColor = 'rgba(255, 255, 255, 0.8)';
        borderColor = 'rgba(173, 216, 230, 0.8)';
        break;
      default:
        hoverColor = 'rgba(255, 255, 255, 0.15)';
        shineColor = 'rgba(255, 255, 255, 0.5)';
        borderColor = 'rgba(255, 255, 255, 0.5)';
    }

    const card = document.createElement('div');
    card.classList.add('card');
    card.style.setProperty('--hover-color', hoverColor);
    card.style.setProperty('--shine-color', shineColor);
    card.style.setProperty('--border-color', borderColor);
    card.dataset.weatherMain = weatherMain; // for filtering

    card.innerHTML = `
      <div class="icon">${icon}</div>
      <h2>${data.name} <small>${data.sys.country}</small></h2>
      <div class="temp">${temp}°C</div>
      <div class="feels-like">Feels like: ${feelsLike}°C</div>
      <p>${weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1)}</p>
      <div class="details">
        <div>💧 ${humidity}%</div>
        <div>🌬 ${windSpeed} km/h</div>
        <div>🌡 ${pressure} hPa</div>
        <div>👁 ${visibility} km</div>
      </div>
    `;
    addPeelEffect(card);
    return card;
  }

  async function renderCities(cities) {
    dashboard.innerHTML = '';
    for (const city of cities) {
      try {
        const data = await fetchWeather(city.name);
        const card = createCard(data);
        dashboard.appendChild(card);
      } catch (err) {
        console.warn(err.message);
      }
    }
  }

  async function searchCity(city) {
    dashboard.innerHTML = '';
    try {
      const data = await fetchWeather(city);
      const card = createCard(data);
      dashboard.appendChild(card);
    } catch (err) {
      alert(err.message);
    }
  }

  // Search button click handler
  searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (!city) return;
    setActiveFilterButton(null);
    searchCity(city);
  });

  // Enter key press handler on input
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchBtn.click();
    }
  });

  // Refresh button reloads default cities and resets filters
  refreshBtn.addEventListener('click', () => {
    setActiveFilterButton(document.querySelector('.filters button[data-filter="all"]'));
    renderCities(defaultCities);
  });

  // Set active filter button styling
  function setActiveFilterButton(button) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
  }

  // Filter buttons click
  filterButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const filter = button.dataset.filter;
      setActiveFilterButton(button);
      searchInput.value = '';

      if (filter === 'all') {
        // Show all default cities
        renderCities(defaultCities);
      } else {
        // Filter cards by weather type
        // We need to load all default cities, then filter their cards by weatherMain
        dashboard.innerHTML = '';
        for (const city of defaultCities) {
          try {
            const data = await fetchWeather(city.name);
            if (filter === 'Rain') {
              // Include Rain and Drizzle for Rainy filter
              if (data.weather[0].main === 'Rain' || data.weather[0].main === 'Drizzle') {
                const card = createCard(data);
                dashboard.appendChild(card);
              }
            } else {
              if (data.weather[0].main === filter) {
                const card = createCard(data);
                dashboard.appendChild(card);
              }
            }
          } catch (err) {
            console.warn(err.message);
          }
        }
      }
    });
  });

  // On page load: render all default cities and activate "All Weather"
  window.onload = () => {
    setActiveFilterButton(document.querySelector('.filters button[data-filter="all"]'));
    renderCities(defaultCities);
  };