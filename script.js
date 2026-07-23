// ⚠️ Nota de segurança: esta chave fica visível publicamente no repositório
// (é inevitável em um site 100% estático como este). O mínimo recomendado é
// restringi-la por domínio/referrer no painel do OpenWeatherMap, em
// "API keys" > sua chave > "Restrict this key". Para uma proteção completa,
// mova as chamadas para uma function serverless (Vercel/Netlify/Cloudflare
// Workers) que guarda a chave no backend e o front-end chama essa function.
const key = "5287d50d6b9246b856c3073e7e8f3371";

const weatherBg = document.querySelector(".weather-bg");
const errorBox = document.getElementById("error-message");
const suggestionsList = document.getElementById("suggestions");
const inputCity = document.getElementById("input-city");
const unitToggleBtn = document.getElementById("unit-toggle");

let unidade = localStorage.getItem("temporal_unidade") || "metric"; // metric (°C) | imperial (°F)
let ultimoClimaAtual = null;
let ultimaPrevisao = null;
let sugestoes = [];
let indiceSugestaoAtiva = -1;
let debounceId = null;

unitToggleBtn.textContent = unidade === "metric" ? "°C" : "°F";

// ── Formatação com unidade ──────────────────────────────────────────────────
function formatarTemp(celsius) {
    const valor = unidade === "imperial" ? (celsius * 9) / 5 + 32 : celsius;
    return Math.round(valor) + "°";
}

function formatarVento(metrosPorSegundo) {
    const valor = unidade === "imperial" ? metrosPorSegundo * 2.23694 : metrosPorSegundo * 3.6;
    const unidadeTexto = unidade === "imperial" ? "mph" : "km/h";
    return Math.round(valor) + " " + unidadeTexto;
}

function alternarUnidade() {
    unidade = unidade === "metric" ? "imperial" : "metric";
    localStorage.setItem("temporal_unidade", unidade);
    unitToggleBtn.textContent = unidade === "metric" ? "°C" : "°F";
    if (ultimoClimaAtual) mostrarDados(ultimoClimaAtual);
    if (ultimaPrevisao) mostrarPrevisao(ultimaPrevisao);
}

// ── Mensagens de erro inline (substitui alert) ──────────────────────────────
function mostrarErro(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
}

function limparErro() {
    errorBox.hidden = true;
    errorBox.textContent = "";
}

// ── Exibe dados atuais ──────────────────────────────────────────────────────
function mostrarDados(dados) {
    ultimoClimaAtual = dados;

    document.querySelector(".city").innerHTML = dados.name;

    const lat = dados.coord.lat;
    const lon = dados.coord.lon;
    const latDir = lat >= 0 ? "N" : "S";
    const lonDir = lon >= 0 ? "L" : "O";
    document.querySelector(".country").innerHTML =
        `${dados.sys.country} &bull; ${Math.abs(lat).toFixed(1)}°${latDir} ${Math.abs(lon).toFixed(1)}°${lonDir}`;

    document.querySelector(".temp").innerHTML = formatarTemp(dados.main.temp);
    document.querySelector(".text-prevision").innerHTML = dados.weather[0].description;
    document.querySelector(".humidity-val").innerHTML = dados.main.humidity + "%";
    document.querySelector(".wind-val").innerHTML = formatarVento(dados.wind.speed);
    document.querySelector(".feels-val").innerHTML = formatarTemp(dados.main.feels_like);

    const icon = document.querySelector(".icon-prevision");
    icon.style.display = "inline-block";
    icon.src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}@2x.png`;
    icon.alt = dados.weather[0].description;

    definirBackground(dados.weather[0].main, dados.weather[0].icon);
}

// ── Fundo animado (CSS + partículas), sem depender de GIFs externos ─────────
function limparParticulas() {
    weatherBg.innerHTML = "";
}

function criarParticulas(qtd, criarElemento) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < qtd; i++) frag.appendChild(criarElemento(i));
    weatherBg.appendChild(frag);
}

function adicionarEstrelas(qtd) {
    criarParticulas(qtd, () => {
        const el = document.createElement("div");
        el.className = "star";
        const tamanho = (Math.random() * 1.8 + 1).toFixed(1);
        el.style.width = tamanho + "px";
        el.style.height = tamanho + "px";
        el.style.left = Math.random() * 100 + "%";
        el.style.top = Math.random() * 70 + "%";
        el.style.animationDuration = (Math.random() * 3 + 2).toFixed(1) + "s";
        el.style.animationDelay = (Math.random() * 3).toFixed(1) + "s";
        return el;
    });
}

function adicionarNuvens(qtd) {
    criarParticulas(qtd, (i) => {
        const el = document.createElement("div");
        el.className = "cloud-blob";
        const tamanho = Math.random() * 120 + 100;
        el.style.width = tamanho + "px";
        el.style.height = tamanho * 0.6 + "px";
        el.style.top = Math.random() * 55 + "%";
        el.style.animationDuration = (Math.random() * 25 + 30).toFixed(1) + "s";
        el.style.animationDelay = -(i * 8) + "s";
        return el;
    });
}

function adicionarChuva(qtd) {
    criarParticulas(qtd, () => {
        const el = document.createElement("div");
        el.className = "raindrop";
        el.style.left = Math.random() * 100 + "%";
        el.style.height = (Math.random() * 30 + 15) + "px";
        el.style.animationDuration = (Math.random() * 0.5 + 0.4).toFixed(2) + "s";
        el.style.animationDelay = (Math.random() * 2).toFixed(2) + "s";
        return el;
    });
}

function adicionarNeve(qtd) {
    criarParticulas(qtd, () => {
        const el = document.createElement("div");
        el.className = "snowflake";
        const tamanho = (Math.random() * 3 + 2).toFixed(1);
        el.style.width = tamanho + "px";
        el.style.height = tamanho + "px";
        el.style.left = Math.random() * 100 + "%";
        el.style.animationDuration = (Math.random() * 6 + 6).toFixed(1) + "s";
        el.style.animationDelay = (Math.random() * 6).toFixed(1) + "s";
        return el;
    });
}

function adicionarFlash() {
    const el = document.createElement("div");
    el.className = "flash";
    weatherBg.appendChild(el);
}

function definirBackground(climaMain, icone) {
    const clima = climaMain.toLowerCase();
    const isNight = icone.includes("n");
    let tipo = "cloudy";

    if (clima.includes("thunderstorm")) tipo = "thunderstorm";
    else if (clima.includes("rain") || clima.includes("drizzle")) tipo = "rain";
    else if (clima.includes("snow")) tipo = "snow";
    else if (clima.includes("clear") && isNight) tipo = "clear-night";
    else if (clima.includes("clear")) tipo = "clear-day";
    else if (clima.includes("cloud") && isNight) tipo = "clear-night";

    weatherBg.className = "weather-bg " + tipo;
    limparParticulas();

    switch (tipo) {
        case "clear-night":
            adicionarEstrelas(50);
            break;
        case "cloudy":
            adicionarNuvens(4);
            break;
        case "rain":
            adicionarNuvens(2);
            adicionarChuva(45);
            break;
        case "thunderstorm":
            adicionarNuvens(2);
            adicionarChuva(45);
            adicionarFlash();
            break;
        case "snow":
            adicionarNeve(35);
            break;
    }
}

// ── Previsão dos próximos dias ──────────────────────────────────────────────
function mostrarPrevisao(lista) {
    ultimaPrevisao = lista;

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
        const tempMax = formatarTemp(item.main.temp_max);
        const tempMin = formatarTemp(item.main.temp_min);
        const icone = item.weather[0].icon;
        const descricao = item.weather[0].description;

        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
            <div class="forecast-day">${diaSemana}</div>
            <img src="https://openweathermap.org/img/wn/${icone}@2x.png" alt="${descricao}" title="${descricao}">
            <div class="forecast-temp">
                <span class="temp-max">${tempMax}</span>
                <span class="temp-min">${tempMin}</span>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelector(".forecast-box").style.display = "block";
}

// ── Busca por nome de cidade ────────────────────────────────────────────────
async function buscarCidade(cidade) {
    setLoading(true);
    limparErro();
    try {
        const [resAtual, resForecast] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${key}&lang=pt_br&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${key}&lang=pt_br&units=metric`)
        ]);

        const atual = await resAtual.json();
        const forecast = await resForecast.json();

        if (atual.cod !== 200) {
            mostrarErro("Cidade não encontrada. Verifique o nome e tente novamente.");
            return;
        }

        mostrarDados(atual);
        if (forecast.cod === "200") mostrarPrevisao(forecast.list);
        salvarUltimaBusca({ tipo: "cidade", valor: cidade });

    } catch (erro) {
        console.error("Erro:", erro);
        mostrarErro("Erro ao buscar dados. Verifique sua conexão e tente novamente.");
    } finally {
        setLoading(false);
    }
}

// ── Busca por coordenadas (geolocalização) ──────────────────────────────────
async function buscarPorCoordenadas(lat, lon, salvar = true) {
    setLoading(true);
    limparErro();
    try {
        const [resAtual, resForecast] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br&units=metric`)
        ]);

        const atual = await resAtual.json();
        const forecast = await resForecast.json();

        if (atual.cod !== 200) {
            mostrarErro("Não foi possível obter o clima dessa localização.");
            return;
        }

        mostrarDados(atual);
        if (forecast.cod === "200") mostrarPrevisao(forecast.list);
        if (salvar) salvarUltimaBusca({ tipo: "coords", lat, lon });

    } catch (erro) {
        console.error("Erro:", erro);
        mostrarErro("Erro ao buscar dados. Verifique sua conexão e tente novamente.");
    } finally {
        setLoading(false);
    }
}

// ── Geolocalização ──────────────────────────────────────────────────────────
function usarGeolocalizacao() {
    if (!navigator.geolocation) {
        mostrarErro("Geolocalização não suportada pelo seu navegador.");
        return;
    }
    limparErro();
    navigator.geolocation.getCurrentPosition(
        pos => buscarPorCoordenadas(pos.coords.latitude, pos.coords.longitude),
        ()  => mostrarErro("Não foi possível obter sua localização. Verifique as permissões do navegador.")
    );
}

// ── Botão de busca ──────────────────────────────────────────────────────────
function cliqueiNoBotao() {
    esconderSugestoes();
    const cidade = inputCity.value.trim();
    if (cidade) {
        buscarCidade(cidade);
    } else {
        mostrarErro("Digite o nome de uma cidade.");
    }
}

// ── Persistência da última busca ────────────────────────────────────────────
function salvarUltimaBusca(info) {
    localStorage.setItem("temporal_ultima_busca", JSON.stringify(info));
}

function carregarUltimaBusca() {
    const salvo = localStorage.getItem("temporal_ultima_busca");
    if (!salvo) return;
    try {
        const info = JSON.parse(salvo);
        if (info.tipo === "cidade") buscarCidade(info.valor);
        else if (info.tipo === "coords") buscarPorCoordenadas(info.lat, info.lon, false);
    } catch (e) {
        console.error("Não foi possível carregar a última busca:", e);
    }
}

// ── Autocomplete de cidades (OpenWeatherMap Geocoding API) ─────────────────
function handleInput() {
    const termo = inputCity.value.trim();
    clearTimeout(debounceId);

    if (termo.length < 3) {
        esconderSugestoes();
        return;
    }

    debounceId = setTimeout(() => buscarSugestoes(termo), 350);
}

async function buscarSugestoes(termo) {
    try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(termo)}&limit=5&appid=${key}`);
        const dados = await res.json();
        sugestoes = Array.isArray(dados) ? dados : [];
        renderizarSugestoes();
    } catch (erro) {
        console.error("Erro ao buscar sugestões:", erro);
    }
}

function renderizarSugestoes() {
    indiceSugestaoAtiva = -1;
    suggestionsList.innerHTML = "";

    if (sugestoes.length === 0) {
        esconderSugestoes();
        return;
    }

    sugestoes.forEach((s, i) => {
        const li = document.createElement("li");
        li.setAttribute("role", "option");
        const estado = s.state ? `${s.state}, ` : "";
        li.innerHTML = `<span>${s.name}</span><span class="sub">${estado}${s.country}</span>`;
        li.addEventListener("mousedown", () => selecionarSugestao(i));
        suggestionsList.appendChild(li);
    });

    suggestionsList.hidden = false;
}

function selecionarSugestao(i) {
    const s = sugestoes[i];
    if (!s) return;
    inputCity.value = s.state ? `${s.name}, ${s.state}` : s.name;
    esconderSugestoes();
    buscarPorCoordenadas(s.lat, s.lon);
}

function esconderSugestoes() {
    suggestionsList.hidden = true;
    suggestionsList.innerHTML = "";
    sugestoes = [];
    indiceSugestaoAtiva = -1;
}

function handleBlur() {
    // pequeno atraso para permitir o clique (mousedown) na sugestão antes de escondê-la
    setTimeout(esconderSugestoes, 120);
}

function handleKeyDown(event) {
    const itens = suggestionsList.querySelectorAll("li");

    if (event.key === "Enter") {
        if (indiceSugestaoAtiva >= 0 && itens[indiceSugestaoAtiva]) {
            selecionarSugestao(indiceSugestaoAtiva);
        } else {
            cliqueiNoBotao();
        }
        return;
    }

    if (!itens.length) return;

    if (event.key === "ArrowDown") {
        event.preventDefault();
        indiceSugestaoAtiva = (indiceSugestaoAtiva + 1) % itens.length;
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        indiceSugestaoAtiva = (indiceSugestaoAtiva - 1 + itens.length) % itens.length;
    } else if (event.key === "Escape") {
        esconderSugestoes();
        return;
    } else {
        return;
    }

    itens.forEach((li, i) => li.classList.toggle("active", i === indiceSugestaoAtiva));
}

// ── Feedback visual de loading ──────────────────────────────────────────────
function setLoading(ativo) {
    const midBox = document.querySelector(".mid-box");
    const botaoBusca = document.querySelector(".button-search");
    const botaoGeo = document.querySelector(".button-geo");

    midBox.classList.toggle("loading", ativo);
    botaoBusca.disabled = ativo;
    botaoGeo.disabled = ativo;
}

// ── Inicialização ────────────────────────────────────────────────────────────
carregarUltimaBusca();