const apiUrl = 'https://api.openf1.org/v1/'
const form = document.querySelector('#selectRace');
const year = form.querySelector('#year');
const circuit = form.querySelector('#circuit');

async function getSession(e) {
    e.preventDefault();
    
    const session = await fetch(`${apiUrl}sessions?location=${circuit.value}&session_name=Race&year=${year.value}`)
        .then((response) => response.json());

    const sessionKey = session && session.length && session[0].session_key;

    if (!sessionKey){
        console.error('Didnt find a session key');
        return;
    }else{
        getPodium(sessionKey);
    }
}

async function getPodium(sessionKey) {    
    const podium = await fetch(`${apiUrl}session_result?session_key=${sessionKey}&position<=3`)
        .then((response) => response.json())
        .then((jsonContent) => [...jsonContent]);

    const drivers = podium.map(driver => [driver.driver_number, driver.duration, driver.position, driver.points, driver.gap_to_leader])

    if(!drivers){
        console.error('Didnt find a podium')
    }else{
        getDriverInfo(drivers, sessionKey);
    }
}

async function getDriverInfo(drivers, sessionKey){
    let driversInfo = [];
     for(let driver of drivers){
        const driverInfo = await fetch(`${apiUrl}drivers?driver_number=${driver[0]}&session_key=${sessionKey}`)
            .then((response) => response.json())
            .then((jsonContent) => jsonContent[0]);

        driverInfo.time = driver[1];
        driverInfo.position = driver[2];
        driverInfo.points = driver[3];
        driverInfo.gapTo1 = driver[4];
        driversInfo.push(driverInfo);
    };
    console.log(driversInfo);
}

async function getYearCircuits(){
    const yearSessions = await fetch(`${apiUrl}sessions?session_name=Race&year=${year.value}`)
        .then((response) => response.json())
        .then((jsonContent) => [...jsonContent]);
        
    const yearCircuits = yearSessions.map(session => [session.location, session.country_name]);
    
    if(!yearCircuits){
        console.error('Didnt find year circuits');
        return;
    }else{
        populateSelect(yearCircuits, circuit);
    }
}

function populateSelect(circuits, circuitsList){
    let html = '';
    circuits.forEach(circuit => {
        html += `
        <option value="${circuit[0]}">${circuit[0]} - ${circuit[1]}</option>
        `
    });
    circuitsList.innerHTML = html;
}

function checkYear() {
    if(year.value>=2023 && year.value<=2025){
        getYearCircuits(); 
    }else{
        year.value = '';
        year.placeholder = 'Not a valid year!';
        circuit.innerHTML = `
        <option value="">Select a valid year</option>
        `
    }
}

form.addEventListener('submit', getSession);
year.addEventListener('change', checkYear);