const submitBtn = document.getElementById('submitBtn');
const cityName = document.getElementById('cityName');
const cityShow = document.getElementById('city-name');
const tempVal = document.getElementById('temp-val');
const tempIcon = document.getElementById('temp-icon');
const dataHide = document.querySelector('.sub-part ');

// Open Weather Map Link: https://openweathermap.org/
const API_KEY = '504d71cbcc4ee163ac37c9ad5ef88c20';

const getInfo = async(event) => {
    event.preventDefault();
    
    let cityVal = cityName.value;
    if(cityVal === "") {
        cityShow.innerText = `Please Enter City Name In Search Bar 🤔`
        dataHide.classList.add('data-hide');
    }
    else {
        try {
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityVal}&units=metric&appid=${API_KEY}`
            const response = await fetch(url);
            const data = await response.json();

            // json to array or array of objects
            const arrayData = [data];

            cityShow.innerText = `${arrayData[0].name}, ${arrayData[0].sys.country}`;
            tempVal.innerText = parseInt(arrayData[0].main.temp);

            const weatherStatus = arrayData[0].weather[0].main;
            if(weatherStatus == "Clear") {
                tempIcon.innerHTML = "<i class='fas fa-sun' style='color: #eccc68;'></i>";
            }
            else if(weatherStatus == "Clouds") {
                tempIcon.innerHTML = "<i class='fas fa-cloud' style='color: #f1f2f6;'></i>";              
            }
            else if(weatherStatus == "Rain") {
                tempIcon.innerHTML = "<i class='fa fa-cloud-rain' style='color: #00b4d8;'></i>";
            }
            else {
                tempIcon.innerHTML = "<i class='fas fa-sun' style='color: #eccc68;'></i>";
            }
            dataHide.classList.remove('data-hide');
            console.log(data);
        }
        catch {
            cityShow.innerText = `Please Enter City Name Properly 🤔`;
            dataHide.classList.add('data-hide');
        }
        
    }
}

submitBtn.addEventListener('click', getInfo);
