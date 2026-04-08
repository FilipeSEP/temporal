const key = "5287d50d6b9246b856c3073e7e8f3371";

// GIFs do GIPHY que funcionam (links diretos)
const gifsClima = {
    chuva: "https://filipesep.github.io/temporal/gifs/rain.gif",
    nublado: "https://filipesep.github.io/temporal/gifs/cloud.gif",
    ceuLimpo: "https://filipesep.github.io/temporal/gifs/clear.gif",
    neve: "https://filipesep.github.io/temporal/gifs/snow.gif",
    noite: "https://filipesep.github.io/temporal/gifs/night.gif"
};

function mostrarDados(dados) {
    document.querySelector(".city").innerHTML = "Tempo em " + dados.name;
    document.querySelector(".temp").innerHTML = Math.floor(dados.main.temp) + "°C";
    document.querySelector(".text-prevision").innerHTML = dados.weather[0].description;
    document.querySelector(".humidity").innerHTML = "💧 Umidade: " + dados.main.humidity + "%";
    document.querySelector(".wind").innerHTML = "💨 Vento: " + dados.wind.speed + " km/h";
    
    const icon = document.querySelector(".icon-prevision");
    icon.style.display = "inline-block";
    icon.src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}@2x.png`;
    
    const clima = dados.weather[0].main.toLowerCase();
    const icone = dados.weather[0].icon;
    const isNight = icone.includes("n");
    
    let gifEscolhido = "";
    
    if (clima.includes("rain") || clima.includes("drizzle")) {
        gifEscolhido = gifsClima.chuva;
    } else if (clima.includes("cloud")) {
        gifEscolhido = gifsClima.nublado;
    } else if (clima.includes("clear") && !isNight) {
        gifEscolhido = gifsClima.ceuLimpo;
    } else if (clima.includes("snow")) {
        gifEscolhido = gifsClima.neve;
    } else if (isNight) {
        gifEscolhido = gifsClima.noite;
    } else {
        gifEscolhido = gifsClima.nublado;
    }
    
    document.body.style.backgroundImage = `url('${gifEscolhido}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
}

async function buscarCidade(cidade) {
    try {
        const resposta = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${key}&lang=pt_br&units=metric`);
        const dados = await resposta.json();
        
        if (dados.cod === 200) {
            mostrarDados(dados);
        } else {
            alert("Cidade não encontrada!");
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao buscar dados!");
    }
}

function cliqueiNoBotao() {
    const cidade = document.querySelector(".input-city").value.trim();
    if (cidade) {
        buscarCidade(cidade);
    } else {
        alert("Digite o nome de uma cidade!");
    }
}

document.querySelector(".input-city").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        cliqueiNoBotao();
    }
});

document.body.style.backgroundImage = "url('https://media1.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif')";
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";
document.body.style.backgroundRepeat = "no-repeat";