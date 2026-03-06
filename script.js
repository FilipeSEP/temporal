const apiKey = "5287d50d6b9246b856c3073e7e8f3371";

// Pegando elementos do HTML
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const cityElement = document.getElementById("city");
const tempElement = document.getElementById("temperature");
const descElement = document.getElementById("description");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const iconElement = document.getElementById("weather-icon");

async function buscarClima(cidade) {
    try {
        const resposta = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`
        );
        const dados = await resposta.json();

        if (dados.cod === 200) {
            // Atualiza a interface
            cityElement.textContent = `Tempo em ${dados.name}`;
            tempElement.textContent = `${Math.floor(dados.main.temp)}°C`;
            descElement.textContent = dados.weather[0].description;
            humidityElement.textContent = `Umidade: ${dados.main.humidity}%`;
            windElement.textContent = `Vento: ${dados.wind.speed} km/h`;
            
            iconElement.style.display = "inline-block";
            iconElement.src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}.png`;
        } else {
            alert("Cidade não encontrada!");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao buscar dados da cidade!");
    }
}

// Evento do botão
searchBtn.addEventListener("click", () => {
    const cidade = cityInput.value.trim();
    if (cidade) {
        buscarClima(cidade);
    } else {
        alert("Digite uma cidade!");
    }
});

// Evento do Enter
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const cidade = cityInput.value.trim();
        if (cidade) {
            buscarClima(cidade);
        } else {
            alert("Digite uma cidade!");
        }
    }
});