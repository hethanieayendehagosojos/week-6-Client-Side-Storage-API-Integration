function saveData()
        {
        let name =document.getElementById("username").value;
        localStorage.setItem("userName", name);
        document.getElementById("display").innerText = name ? "Welcome, " + name + "!" : "Please enter your name.";
        }
        function loadData()
        {
        let name = localStorage.getItem("userName");
        document.getElementById("display").innerText = name ? "Welcome, " + name : "No data saved!";
        }
        
// Load saved preferences
window.onload = function() {

    let savedName = localStorage.getItem("userName");
    let savedTheme = localStorage.getItem("theme");
    let savedLanguage = localStorage.getItem("language");
    // localStorage.removeItem("userName");

    if (savedName) {
        loadData();
    }
    if (savedTheme == "dark") {
        document.body.classList.add("dark");
    }
    if (savedTheme) {
        document.getElementById("theme").value = savedTheme;
    }
    if (savedLanguage) {
        document.getElementById("language").value = savedLanguage;
        changeLanguage(savedLanguage);
    }

    initLiveMap();
};

function initLiveMap() {
    let mapElement = document.getElementById("live-map");
    let statusElement = document.getElementById("location-status");
    let searchForm = document.getElementById("location-search-form");

    if (!mapElement || !statusElement) {
        return;
    }

    let map = L.map(mapElement).setView([14.5995, 120.9842], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    window.addEventListener("home-ready", function() {
        window.setTimeout(function() {
            map.invalidateSize();
        }, 650);
    });

    let marker;
    let accuracyCircle;
    let centeredOnLiveLocation = false;

    if (!navigator.geolocation) {
        statusElement.textContent = "Live location is not supported by this browser. Showing Manila instead.";
    }

    if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function(position) {
        let location = [position.coords.latitude, position.coords.longitude];

        if (!marker) {
            marker = L.marker(location).addTo(map).bindPopup("Your current location").openPopup();
        } else {
            marker.setLatLng(location);
        }

        if (!accuracyCircle) {
            accuracyCircle = L.circle(location, {
                radius: position.coords.accuracy,
                color: "#0d6efd",
                fillColor: "#0d6efd",
                fillOpacity: 0.15
            }).addTo(map);
        } else {
            accuracyCircle.setLatLng(location);
            accuracyCircle.setRadius(position.coords.accuracy);
        }

        if (!centeredOnLiveLocation) {
            map.setView(location, 15);
            centeredOnLiveLocation = true;
        }
        statusElement.textContent = "Live location updated at " + new Date().toLocaleTimeString() + ". Accuracy: " + Math.round(position.coords.accuracy) + " meters.";
    }, function(error) {
        statusElement.textContent = "Location access was unavailable (" + error.message + "). Showing Manila instead.";
    }, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
    });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", function(event) {
            event.preventDefault();
            searchLocation(map);
        });
    }

}

// Save preferences
function savePreferences() {
    let theme = document.getElementById("theme").value;
    let language = document.getElementById("language").value;

    // Save to Local Storage
    localStorage.setItem("theme", theme);
    localStorage.setItem("language", language);

    // Change theme
    if (theme == "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
    // Change language
    changeLanguage(language);

    document.getElementById("message").textContent =
        "Preferences saved!";
}

// Change language
function changeLanguage(language) {
    let translations = {
        english: {
            title: "Weather Website",
            home: "Home",
            preferences: "User Preferences",
            weather: "Weather",
            map: "Map",
            welcome: "WELCOME TO MY WEB PAGE!"
        },
        filipino: {
            title: "Website ng Panahon",
            home: "Tahanan",
            preferences: "Mga Kagustuhan ng Gumagamit",
            weather: "Panahon",
            map: "Mapa",
            welcome: "MALIGAYANG PAGDATING!"
        },
        spanish: {
            title: "Sitio del Clima",
            home: "Inicio",
            preferences: "Preferencias del Usuario",
            weather: "Clima",
            map: "Mapa",
            welcome: "¡BIENVENIDO A MI PÁGINA WEB!"
        }
    };

    let selectedLanguage = translations[language] || translations.english;

    document.getElementById("site-title").textContent = selectedLanguage.title;
    document.getElementById("nav-home").textContent = selectedLanguage.home;
    document.getElementById("nav-preferences").textContent = selectedLanguage.preferences;
    document.getElementById("nav-weather").textContent = selectedLanguage.weather;
    document.getElementById("nav-map").textContent = selectedLanguage.map;
    document.getElementById("display").textContent = selectedLanguage.welcome;
}

// Weather API
async function getWeather() {

    let city = document.getElementById("city").value;

    // Put your API key here
    let API_KEY = "YOUR_API_KEY";

    let url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {

        let response = await fetch(url);
        let data = await response.json();

        document.getElementById("weatherCity").textContent =
            data.name;

        document.getElementById("temperature").textContent =
            "Temperature: " + data.main.temp + " °C";

        document.getElementById("description").textContent =
            "Weather: " + data.weather[0].description;

    } catch (error) {

        document.getElementById("weatherCity").textContent =
            "City not found.";

    }
}

function getWeather() {
            let city = document.getElementById("city").value;
            let apiKey = "82ee6423748cc01d1cb1ca9793cbf2c4"; // Replace with your OpenWeatherMap API key
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
 
        fetch(url)
             .then(response => response.json())
             .then(data => {
                 document.getElementById("weatherResult").innerHTML = `
             <p>Temperature: ${data.main.temp}°C</p>
            <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png">
            <p>${data.weather[0].description}</p>
            `;
          })
                .catch(error => console.error("Error fetching weather data:", error));
        }
    
    
async function searchLocation(map) {
    let inputElement = document.getElementById("location-input");
    let statusElement = document.getElementById("search-status");
    let query = inputElement.value.trim();

    if (!query) {
        return;
    }

    statusElement.textContent = "Searching...";

    try {
        let response = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" + encodeURIComponent(query));
        let results = await response.json();

        if (!results.length) {
            statusElement.textContent = "Location not found.";
            return;
        }

        let result = results[0];
        let location = [Number(result.lat), Number(result.lon)];
        L.marker(location).addTo(map).bindPopup(result.display_name).openPopup();
        map.setView(location, 14);
        statusElement.textContent = "Showing: " + result.display_name;
    } catch (error) {
        statusElement.textContent = "The location search is unavailable right now.";
    }
}

function getUser(event) {
            if (event) {
                event.preventDefault();
            }

            let usernameElement = document.getElementById("github-username");
            let resultElement = document.getElementById("userResult");
            let username = usernameElement.value.trim();

            if (!username) {
                resultElement.textContent = "Please enter a GitHub username.";
                return;
            }

            let url = `https://api.github.com/users/${username}`;

            resultElement.textContent = "Loading GitHub user...";
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.status === 404 ? "GitHub user not found." : "GitHub request failed.");
                    }
                    return response.json();
                })
                .then(data => {
                   resultElement.innerHTML = `
                       <h3>${data.name || "No Name Found"}</h3>
                       <img src="${data.avatar_url}" width="100">
                       <p>Public Repos: ${data.public_repos}</p>
                       <p>Followers: ${data.followers}</p>
                    `;
                          document.body.classList.remove("github-start");
                          document.body.classList.add("home-ready");
                    window.dispatchEvent(new Event("home-ready"));
                          document.getElementById("home").scrollIntoView({ behavior: "smooth" });
                })
                .catch(error => {
                    resultElement.textContent = error.message;
                });
        }