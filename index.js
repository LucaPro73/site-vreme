// TODO: gaseste undeva sa pun cheia ca sa nu fie direct aici
const API_KEY = "d2bd5827439fe9c41c01e07c84432547"

// https://stackoverflow.com/questions/60791758/how-to-get-country-flag-code-given-the-name-of-the-country
function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2 || !/^[a-zA-Z]+$/.test(countryCode)) {
        return '🏳️';
    }
    const code = countryCode.toUpperCase();
    const offset = 127397;
    const flag = Array.from(code).map(letter => String.fromCodePoint(letter.charCodeAt(0) + offset)).join('');
    return flag;
}

function toSentenceCase(string) {
    return string.split(" ").map((w, i) => i === 0 ? `${w.substring(0, 1).toUpperCase()}${w.substring(1).toLowerCase()}` : w.toLowerCase()).join(" ")
}

async function fetchVreme(nume, unit) {
    const req_loc = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${nume}&limit=1&appid=${API_KEY}`)
    if (req_loc.status !== 200) {
        console.error(req_loc)
        return { error: "A fost o eroare in gasirea locatiei" }
    }
    const res_loc = await req_loc.json()
    if (!res_loc?.[0] || !("lat" in res_loc[0])) {
        return { error: "Nu am putut gasi orasul" }
    }
    const { lat, lon } = res_loc[0];

    const req_info = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=ro`)
    if (req_info.status !== 200) {
        console.error(req_info)
        return { error: "A fost o eroare in gasirea datelor meteo" }
    }
    const res = await req_info.json()
    console.log(res, res_loc)
    return {
        ...res,
        cityName: res_loc[0].name,
        flag: countryCodeToFlag(res.sys.country),
        weatherIcon: `https://openweathermap.org/img/wn/${res.weather[0]?.icon || "01d"}@2x.png`,
        weatherDescription: res.weather[0]?.description || "Nu am gasit informatii despre aceasta locatie"
    }
}

async function afisareVreme(nume) {
    const element = document.getElementById("continut-vreme")
    document.getElementById("container-vreme").style.backgroundColor = "rgba(0, 0, 0, 0.3)"
    element.innerHTML = `<img src="./assets/cupertino_activity_indicator_square_medium.gif"/>`

    const unitinput = document.getElementById("unitate")
    const unit = unitinput.value === "f" ? "imperial" : "metric"
    
    const res = await fetchVreme(nume, unit)
    if ("error" in res) element.innerHTML = `<h1>${res.error}</h1>`
    else element.innerHTML = `
<div>
<h1>${res.cityName}, ${res.flag}</h1>
<h3><img src="${res.weatherIcon}" style="width: 20px;"/>
${toSentenceCase(res.weatherDescription)}</h3>
<h3>🌡 ${res.main.temp.toFixed(0)}°${unit === "metric" ? "C" : "F"} (se simte ca ${res.main.feels_like.toFixed(0)}°${unit === "metric" ? "C" : "F"})</h3>
<p>💨 ${res.wind.speed} ${unit === "metric" ? "m/s" : "ft/s"} la ${res.wind.deg}°</p>
<p>💧 ${res.main.humidity}% umiditate
</div>
            `
}

document.getElementById('itemInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const input = event.target;
        if (input.value?.trim() !== '') {
            afisareVreme(input.value)//.then(console.log)
        }
    }
});
document.getElementById('addItem').addEventListener('click', () => {
    const input = document.getElementById('itemInput');
    if (input.value?.trim() !== '') {
        afisareVreme(input.value)//.then(console.log)
    }
});