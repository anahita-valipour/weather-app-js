const API_KEY = "2b84747e7d1f6d2fda94744f770fd1a3";

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const cityElem = document.querySelector("#city");
const feelsLike = document.querySelector("#feels-like");
const humidityElem = document.querySelector("#humidity");
const tempElem = document.querySelector("#temp");
const windElem = document.querySelector("#wind");
const conditionElem = document.querySelector("#condition");
const conditionText = document.querySelector("#condition-text");
const searchStatus = document.querySelector("#search-status");
const searchButton = searchForm.querySelector("button");

let city;
let result;

const fetchdata = async (city) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("OpenWeatherMap rejected the API key. Check the key in script.js.");
      }

      throw new Error(response.status === 404 ? "City not found." : "Could not load weather. Try again.");
    }

    const data = await response.json();
    result = data;
    return true;
  } catch (err) {
    searchStatus.textContent = err instanceof TypeError
      ? "Could not reach the weather service. Try again."
      : err.message;
    return false;
  }
};

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  city = cityInput.value.trim();

  if (city === "" || searchButton.disabled) {
    return;
  }

  searchButton.disabled = true;
  searchStatus.textContent = "Loading weather…";

  try {
    if (await fetchdata(city)) {
      renderWeather();
      searchStatus.textContent = "";
    }
  } finally {
    searchButton.disabled = false;
  }
});

function renderWeather() {
  cityElem.textContent = result.name;
  feelsLike.textContent = result.main.feels_like;
  tempElem.textContent = result.main.temp;
  humidityElem.textContent = result.main.humidity;
  windElem.textContent = `${result.wind.speed} m/s`;

  for (const value of [feelsLike, tempElem, humidityElem]) {
    value.removeAttribute("data-empty");
  }

  const conditionStatus = result.weather[0].main;
  let theme = "theme-cloudy";

  if (["Rain", "Drizzle", "Thunderstorm"].includes(conditionStatus)) {
    theme = "theme-rainy";
  } else if (conditionStatus === "Clear") {
    theme = "theme-sunny";
  }

  document.body.classList.remove("theme-rainy", "theme-cloudy", "theme-sunny");
  document.body.classList.add(theme);
  conditionElem.textContent = conditionStatus;
  conditionText.textContent = result.weather[0].description;
}
