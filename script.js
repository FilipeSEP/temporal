const key = "5287d50d6b9246b856c3073e7e8f3371";

const gifsClima = {
    chuva:    "https://filipesep.github.io/temporal/gifs/rain.gif",
    nublado:  "https://filipesep.github.io/temporal/gifs/cloud.gif",
    ceuLimpo: "https://filipesep.github.io/temporal/gifs/clear.gif",
    neve:     "https://filipesep.github.io/temporal/gifs/snow.gif",
    noite:    "https://filipesep.github.io/temporal/gifs/night.gif",
    trovoada: "https://filipesep.github.io/temporal/gifs/rain.gif" // use gif de chuva até ter um próprio
};

// ── Exibe dados atuais ──────────────────────────────────────────────────────
function mostrarDados(dados) {
    document.querySelector(".city").innerHTML = dados.name;
    document.querySelector(".country").innerHTML =
        `${dados.sys.country} &bull; ${dados.coord.lat.toFixed(1)}°N ${dados.coord.lon.toFixed(1)}°E`;

    document.querySelector(".temp").innerHTML = Math.floor(dados.main.temp) + "°";
    document.querySelector(".text-prevision").innerHTML = dados.weather[0].description;
    document.querySelector(".humidity-val").innerHTML = dados.main.humidity + "%";
    document.querySelector(".wind-val").innerHTML = Math.round(dados.wind.speed * 3.6) + " km/h";
    document.querySelector(".feels-val").innerHTML = Math.floor(dados.main.feels_like) + "°";

    const icon = document.querySelector(".icon-prevision");
    icon.style.display = "inline-block";
    icon.src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}@2x.png`;

    definirBackground(dados.weather[0].main, dados.weather[0].icon);
}

// ── Escolhe o GIF de fundo ──────────────────────────────────────────────────
function definirBackground(climaMain, icone) {
    const clima = climaMain.toLowerCase();
    const isNight = icone.includes("n");
    let gif = gifsClima.nublado;

    if (clima.includes("thunderstorm"))           gif = gifsClima.trovoada;
    else if (clima.includes("rain") || clima.includes("drizzle")) gif = gifsClima.chuva;
    else if (clima.includes("snow"))              gif = gifsClima.neve;
    else if (clima.includes("clear") && isNight)  gif = gifsClima.noite;
    else if (clima.includes("clear"))             gif = gifsClima.ceuLimpo;

    document.body.style.backgroundImage    = `url('${gif}')`;
    document.body.style.backgroundSize     = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat   = "no-repeat";
}

// ── Previsão dos próximos dias ──────────────────────────────────────────────
function mostrarPrevisao(lista) {
    const container = document.querySelector(".forecast-days");
    container.innerHTML = "";

    const hoje = new Date().toLocaleDateString("pt-BR");
    const porDia = {};

    lista.forEach(item => {
        const data = new Date(item.dt * 1000);
        const dataStr = data.toLocaleDateString("pt-BR");
        const hora = data.getHours();

        if (dataStr === hoje) return;
        if (
            !porDia[dataStr] ||
            Math.abs(hora - 12) < Math.abs(new Date(porDia[dataStr].dt * 1000).getHours() - 12)
        ) {
            porDia[dataStr] = item;
        }
    });

    Object.values(porDia).slice(0, 4).forEach(item => {
        const data = new Date(item.dt * 1000);
        const diaSemana = data.toLocaleDateString("pt-BR", { weekday: "short" });
        const tempMax = Math.floor(item.main.temp_max);
        const tempMin = Math.floor(item.main.temp_min);
        const icone = item.weather[0].icon;
        const descricao = item.weather[0].description;

        container.innerHTML += `
            <div class="forecast-card">
                <div class="forecast-day">${diaSemana}</div>
                <img src="https://openweathermap.org/img/wn/${icone}@2x.png" alt="${descricao}" title="${descricao}">
                <div class="forecast-temp">
                    <span class="temp-max">${tempMax}°</span>
                    <span class="temp-min">${tempMin}°</span>
                </div>
            </div>
        `;
    });

    document.querySelector(".forecast-box").style.display = "block";
}

// ── Busca por nome de cidade ────────────────────────────────────────────────
async function buscarCidade(cidade) {
    setLoading(true);
    try {
        const [resAtual, resForecast] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${key}&lang=pt_br&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${key}&lang=pt_br&units=metric`)
        ]);

        const atual = await resAtual.json();
        const forecast = await resForecast.json();

        if (atual.cod !== 200) {
            alert("Cidade não encontrada!");
            return;
        }

        mostrarDados(atual);
        if (forecast.cod === "200") mostrarPrevisao(forecast.list);

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao buscar dados. Tente novamente.");
    } finally {
        setLoading(false);
    }
}

// ── Busca por coordenadas (geolocalização) ──────────────────────────────────
async function buscarPorCoordenadas(lat, lon) {
    setLoading(true);
    try {
        const [resAtual, resForecast] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br&units=metric`)
        ]);

        const atual = await resAtual.json();
        const forecast = await resForecast.json();

        if (atual.cod !== 200) {
            alert("Não foi possível obter o clima da sua localização.");
            return;
        }

        mostrarDados(atual);
        if (forecast.cod === "200") mostrarPrevisao(forecast.list);

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao buscar dados. Tente novamente.");
    } finally {
        setLoading(false);
    }
}

// ── Geolocalização ──────────────────────────────────────────────────────────
function usarGeolocalizacao() {
    if (!navigator.geolocation) {
        alert("Geolocalização não suportada pelo seu navegador.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => buscarPorCoordenadas(pos.coords.latitude, pos.coords.longitude),
        ()  => alert("Não foi possível obter sua localização. Verifique as permissões do navegador.")
    );
}

// ── Botão de busca ──────────────────────────────────────────────────────────
function cliqueiNoBotao() {
    const cidade = document.getElementById("input-city").value.trim();
    if (cidade) {
        buscarCidade(cidade);
    } else {
        alert("Digite o nome de uma cidade!");
    }
}

// ── Feedback visual de loading ──────────────────────────────────────────────
function setLoading(ativo) {
    const midBox = document.querySelector(".mid-box");
    ativo
        ? midBox.classList.add("loading")
        : midBox.classList.remove("loading");
}