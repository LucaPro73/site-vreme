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

async function vremeOras(nume) {
    const element = document.getElementById("continut-vreme")
    document.getElementById("container-vreme").style.backgroundColor = "rgba(0, 0, 0, 0.3)"

    element.innerHTML = `<img src="https://raw.githubusercontent.com/Codelessly/FlutterLoadingGIFs/master/packages/cupertino_activity_indicator_square_medium.gif"/>`
    const req_loc = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${nume}&limit=1&appid=${API_KEY}`)
    if (req_loc.status !== 200) {
        element.innerHTML = `<h1>A fost o eroare in gasirea locatiei</h1>`
        return console.error(req_loc)
    }
    const res_loc = await req_loc.json()
    if (!res_loc?.[0] || !("lat" in res_loc[0])) {
        element.innerHTML = `<h1>Nu am putut gasi orasul</h1>`
        return console.error(req_loc, res_loc)
    }
    const { lat, lon } = res_loc[0];

    const unitinput = document.getElementById("unitate")
    // console.log(unitinput, unitinput.value)
    const unit = unitinput.value === "f" ? "imperial" : "metric"

    const req_info = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}&lang=ro`)
    if (req_info.status !== 200) {
        element.innerHTML = `<h1>A fost o eroare in gasirea datelor meteo</h1>`
        return console.error(req_info)
    }
    const res = await req_info.json()
    // console.log(res, res_loc)

    element.innerHTML = `
<div>
<h1>${res_loc[0].name}, ${countryCodeToFlag(res.sys.country)}</h1>
<h3><img src="https://openweathermap.org/img/wn/${res.weather[0]?.icon || "01d"}@2x.png" style="width: 20px;"/>
${toSentenceCase(res.weather[0]?.description || "Nu am gasit informatii despre aceasta locatie")}</h3>
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
            vremeOras(input.value)//.then(console.log)
        }
    }
});
document.getElementById('addItem').addEventListener('click', () => {
    const input = document.getElementById('itemInput');
    if (input.value?.trim() !== '') {
        vremeOras(input.value)//.then(console.log)
    }
});