const apiUrl = 'https://api.openf1.org/v1/'
const form = document.querySelector('#selectRace');

async function getSession(e) {
    e.preventDefault();
    const circuit = form.querySelector('#circuit');
    const year = form.querySelector('#year');
    
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

    const drivers = podium.map(driver => [driver.driver_number, driver.duration])

    if(!drivers){
        console.error('Didnt find a podium')
    }else{
        getDriverInfo(drivers, sessionKey);
    }
}

async function getDriverInfo(drivers, sessionKey){
     for(let driver of drivers){
        const driverInfo = await fetch(`${apiUrl}drivers?driver_number=${driver[0]}&session_key=${sessionKey}`)
            .then((response) => response.json())
            .then((jsonContent) => jsonContent[0]);

        driverInfo.time = driver[1];
        driver = driverInfo;
        console.log(driver);
    };
    console.log(drivers);
}



form.addEventListener('submit', getSession);