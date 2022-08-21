const submitBtn = document.getElementById('submitBtn');
const locationBtn = document.getElementById('currentLocation');
const cityName = document.getElementById('cityName');
const cityShow = document.getElementById('city-name');
const tempVal = document.getElementById('temp-val');
const tempIcon = document.querySelector('#temp-icon');
const realFeel = document.getElementById('real-feel');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const description = document.getElementById('description');
const localTime = document.getElementById('local-time-day-date');
const sunRise = document.getElementById('sun-rise');
const sunSet = document.getElementById('sun-set');
const hourlyEl = document.getElementById('hourly-forecast');
const dailyEl = document.getElementById('daily-forecast');
const backgroundChange = document.getElementById('temperature-info');
const dataHide1 = document.querySelector('.sub-part');
const dataHide2 = document.querySelector('.rise-set');
const dataHide3 = document.querySelector('.description');

// openweathermap.com Link: https://openweathermap.org/
const API_KEY = '504d71cbcc4ee163ac37c9ad5ef88c20';
// timezonedb.com: https://timezonedb.com/references/get-time-zone
const TIME_API_KEY = 'MNCK8SABPI08';

var months = [
    "",
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    'AUG',
    "SEP",
    "OCT",
    "NOV",
    "DEC"
];

var days = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT"
];

function formatAMPM(UNIX_timestamp) {

    var date = new Date(UNIX_timestamp * 1000);

    var hours = date.getHours();
    var minutes = date.getMinutes();

    var ampm = hours >= 12 ? 'PM' : 'AM';
    var hrIn12Hr = hours >= 13 ? hours % 12 : hours;
    var hours = hrIn12Hr < 10 ? '0' + hrIn12Hr : hrIn12Hr;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;

    return strTime;
}

const timeAPICall = async (lat, lon, timestamp) => {
    const TIME_URL = `https://api.timezonedb.com/v2.1/get-time-zone?key=${TIME_API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}&time=${timestamp}`
    const timeResponse = await fetch(TIME_URL);
    const time_data = await timeResponse.json();
    return time_data.formatted;
}

const currentInfo = async(event) => {
    event.preventDefault();

    cityName.value = '';

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( async (position) => {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            // // Endpoint Weather
            let URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
            const currentResponse = await fetch(URL);

            // // json data
            const data = await currentResponse.json();

            // json to array or array of objects
            const arrayData = [data];

            const sunrise = arrayData[0].sys.sunrise;
            const sunset = arrayData[0].sys.sunset;
            const weatherIcon = arrayData[0].weather[0].icon;
            const tempValue = parseInt(arrayData[0].main.temp);

            if(tempValue > 25) {
                backgroundChange.style.background = "#cd8f6e";
            }
            else {
                backgroundChange.style.background = "#0077b6";
            }

            cityShow.innerText = `${arrayData[0].name}, ${arrayData[0].sys.country}`;
            tempVal.innerText = tempValue;
            realFeel.innerText = parseInt(arrayData[0].main.feels_like);
            humidity.innerText = arrayData[0].main.humidity;
            windSpeed.innerText = parseInt(arrayData[0].wind.speed);
            description.innerText = arrayData[0].weather[0].description;
            
            tempIcon.src = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

            // Endpoint Onecall
            let DH_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=current,minutely,alerts&appid=${API_KEY}`;
            const DH_response = await fetch(DH_URL);

            // json data
            const DH_data = await DH_response.json();

            let {timezone} = DH_data;

            const sunRiseValue = await timeAPICall(lat, lon, sunrise);
            const sunSetValue = await timeAPICall(lat, lon, sunset);

            sunRise.innerText = `${sunRiseValue.slice(11, 16)}`;
            sunSet.innerText = `${sunSetValue.slice(11, 16)}`;

            let time_url = `http://worldtimeapi.org/api/timezone/${timezone}`;
            const time_response = await fetch(time_url);
            var timeData = await time_response.json();

            const str = timeData.datetime;
            const year = str.slice(0,4);
            const month = months[parseInt(str.slice(5,7))];
            const day = str.slice(8,10);
            const dayName = days[timeData.day_of_week];
            const hr = parseInt(str.slice(11,13));
            const hrIn12Hr = hr >= 13 ? hr % 12 : hr;
            const hours = hrIn12Hr < 10 ? '0' + hrIn12Hr : hrIn12Hr;
            const mins = parseInt(str.slice(14,16));
            const minutes = mins < 10 ? '0' + mins : mins; 
            const amOrPm = hr >= 12 ? 'PM' : 'AM';
            
            localTime.innerText = `${dayName}, ${day} ${month} ${year} | ${hours}:${minutes} ${amOrPm}`;

            let hourlyForcast = ''
            let hrVal = parseInt(hours) + 1;
            let nextHr = (hrVal >= 13) ? hrVal % 12 : hrVal;
            DH_data.hourly.slice(1,6).forEach((hr) => {
                hourlyForcast += `
                <div class="dailyHourly-forecast">
                    <p>${(nextHr < 10 ? '0' + nextHr : nextHr) + ':' + '00'}</p>
                    <img src="http://openweathermap.org/img/wn/${hr.weather[0].icon}@2x.png" alt="weatherIcon" class="w-icon">
                    <p>${parseInt(hr.temp)}&#176;C</p>
                </div>
                `
                nextHr = (nextHr + 1) >= 13 ? (nextHr + 1) % 12 : (nextHr + 1);
            })

            hourlyEl.innerHTML = hourlyForcast;

            let dailyForcast = ''
            DH_data.daily.slice(1,6).forEach((day) => {
                dailyForcast += `
                <div class="dailyHourly-forecast">
                    <p>${window.moment(day.dt*1000).format('ddd').toUpperCase()}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weatherIcon" class="w-icon">
                    <p>${parseInt(day.temp.day)}&#176;C</p>
                </div>
                `
            })

            dailyEl.innerHTML = dailyForcast;
            
            dataHide1.classList.remove('data-hide');
            dataHide2.classList.remove('data-hide');
            dataHide3.classList.remove('data-hide');
        });
    }
}

const getInfo = async(event) => {
    event.preventDefault();
    
    let cityVal = cityName.value;
    if(cityVal === "") {
        cityShow.innerText = `Please Enter City Name In Search Bar 🤔`
        dataHide1.classList.add('data-hide');
        dataHide2.classList.add('data-hide');
        dataHide3.classList.add('data-hide');
    }
    else {
        try {
            // Endpoint Weather
            let W_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityVal}&units=metric&appid=${API_KEY}`
            const response = await fetch(W_URL);

            // json data
            const data = await response.json();

            // json to array or array of objects
            const arrayData = [data];

            const sunrise = arrayData[0].sys.sunrise;
            const sunset = arrayData[0].sys.sunset;
            const weatherIcon = arrayData[0].weather[0].icon;
            const tempValue = parseInt(arrayData[0].main.temp);

            if(tempValue > 25) {
                backgroundChange.style.background = '#' + "cd8f6e";
            }
            else {
                backgroundChange.style.background = '#' + "0077b6";
            }

            cityShow.innerText = `${arrayData[0].name}, ${arrayData[0].sys.country}`;
            tempVal.innerText = parseInt(arrayData[0].main.temp);
            realFeel.innerText = parseInt(arrayData[0].main.feels_like);
            humidity.innerText = arrayData[0].main.humidity;
            windSpeed.innerText = parseInt(arrayData[0].wind.speed);
            description.innerText = arrayData[0].weather[0].description;

            tempIcon.src = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

            const latitude = arrayData[0].coord.lat;
            const longitude = arrayData[0].coord.lon;

            const sunRiseValue = await timeAPICall(latitude, longitude, sunrise);
            const sunSetValue = await timeAPICall(latitude, longitude, sunset);

            sunRise.innerText = `${sunRiseValue.slice(11, 16)}`;
            sunSet.innerText = `${sunSetValue.slice(11, 16)}`;

            // Endpoint Onecall
            let DH_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&exclude=current,minutely,alerts&appid=${API_KEY}`;
            const DH_response = await fetch(DH_URL);

            // json data
            const DH_data = await DH_response.json();

            let {timezone} = DH_data;

            let time_url = `http://worldtimeapi.org/api/timezone/${timezone}`;
            const time_response = await fetch(time_url);
            var timeData = await time_response.json();

            const str = timeData.datetime;
            const year = str.slice(0,4);
            const month = months[parseInt(str.slice(5,7))];
            const day = str.slice(8,10);
            const dayName = days[timeData.day_of_week];
            const hr = parseInt(str.slice(11,13));
            const hrIn12Hr = hr >= 13 ? hr % 12 : hr;
            const hours = hrIn12Hr < 10 ? '0' + hrIn12Hr : hrIn12Hr;
            const mins = parseInt(str.slice(14,16));
            const minutes = mins < 10 ? '0' + mins : mins; 
            const amOrPm = hr >= 12 ? 'PM' : 'AM';
            
            localTime.innerText = `${dayName}, ${day} ${month} ${year} | ${hours}:${minutes} ${amOrPm}`;

            let hourlyForcast = ''
            let hrVal = parseInt(hours) + 1;
            let nextHr = (hrVal >= 13) ? hrVal % 12 : hrVal;
            DH_data.hourly.slice(1,6).forEach((hr) => {
                hourlyForcast += `
                <div class="dailyHourly-forecast">
                    <p>${(nextHr < 10 ? '0' + nextHr : nextHr) + ':' + '00'}</p>
                    <img src="http://openweathermap.org/img/wn/${hr.weather[0].icon}@2x.png" alt="weatherIcon" class="w-icon">
                    <p>${parseInt(hr.temp)}&#176;C</p>
                </div>
                `
                nextHr = (nextHr + 1) >= 13 ? (nextHr + 1) % 12 : (nextHr + 1);
            })

            hourlyEl.innerHTML = hourlyForcast;

            let dailyForcast = ''
            DH_data.daily.slice(1,6).forEach((day) => {
                dailyForcast += `
                <div class="dailyHourly-forecast">
                    <p>${window.moment(day.dt*1000).format('ddd').toUpperCase()}</p>
                    <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weatherIcon" class="w-icon">
                    <p>${parseInt(day.temp.day)}&#176;C</p>
                </div>
                `
            })

            dailyEl.innerHTML = dailyForcast;
            
            dataHide1.classList.remove('data-hide');
            dataHide2.classList.remove('data-hide');
            dataHide3.classList.remove('data-hide');
        }
        catch {
            cityShow.innerText = `Please Enter City Name Properly 🤔`;
            dataHide1.classList.add('data-hide');
            dataHide2.classList.add('data-hide');
            dataHide3.classList.add('data-hide');
        }
        
    }
}
submitBtn.addEventListener('click', getInfo);
locationBtn.addEventListener('click', currentInfo);