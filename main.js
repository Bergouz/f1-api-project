const apiUrl = "https://api.openf1.org/v1/";
const form = document.querySelector("#selectRace");
const year = form.querySelector("#year");
const circuit = form.querySelector("#circuit");

async function getSession(e) {
  e.preventDefault();

  const request = await fetch(
    `${apiUrl}sessions?location=${circuit.value}&session_name=Race&year=${year.value}`
  );
  const session = await request.json();

  const sessionKey = session && session.length && session[0].session_key;

  if (!sessionKey) {
    console.error("Didnt find a session key");
    return;
  } else {
    getPodium(sessionKey);
  }
}

async function getPodium(sessionKey) {
  const request = await fetch(
    `${apiUrl}session_result?session_key=${sessionKey}&position<=3`
  );
  const podium = await request.json();

  const drivers =
    podium &&
    podium.map((driver) => [
      driver.driver_number,
      driver.duration,
      driver.position,
      driver.points,
      driver.gap_to_leader,
    ]);

  if (!drivers) {
    console.error("Didnt find a podium");
  } else {
    getDriverInfo(drivers, sessionKey);
  }
}

async function getDriverInfo(drivers, sessionKey) {
  // let driversInfo = [];y
  // for (let driver of drivers) {
  //   const driverInfo = await fetch(
  //     `${apiUrl}drivers?driver_number=${driver[0]}&session_key=${sessionKey}`
  //   )
  //     .then((response) => response.json())
  //     .then((jsonContent) => jsonContent[0]);

  //   driverInfo.time = driver[1];
  //   driverInfo.position = driver[2];
  //   driverInfo.points = driver[3];
  //   driverInfo.gapTo1 = driver[4];
  //   driversInfo.push(driverInfo);
  // }

  // reescrever com map
  // pesquisar como dar um await em uma lista de promises

  const driversRequest = await drivers.map(async (driver) => {
    const request = await fetch(
      `${apiUrl}drivers?driver_number=${driver[0]}&session_key=${sessionKey}`
    );
    const driverJson = await request.json();
    const driverInfo = driverJson && driverJson[0];
    console.log(driverInfo);
    [
      driverInfo.driver_number,
      driverInfo.time,
      driverInfo.position,
      driverInfo.points,
      driverInfo.gapTo1,
    ] = driver;
    return driverInfo;
  });
  const driversInfo = await Promise.all(driversRequest);

  if (!driversInfo) {
    console.error("Didnt find drivers info");
    return;
  } else {
    displayDrivers(driversInfo);
  }
}

async function getYearCircuits() {
  const request = await fetch(
    `${apiUrl}sessions?session_name=Race&year=${year.value}`
  );
  const yearSessions = await request.json();

  const yearCircuits = yearSessions.map((session) => [
    session.location,
    session.country_name,
  ]);

  if (!yearCircuits) {
    console.error("Didnt find year circuits");
    return;
  } else {
    populateSelect(yearCircuits, circuit);
  }
}
// imutabilidade
// map, filter, reduce

// ordem de velocidade
// 1 - for - sincrono
// 2 - map-
// 3 - filter
// 4 - forEach
// funcao some

function populateSelect(circuits, circuitsList) {
  const options = circuits.map(
    (circuit) => `
        <option value="${circuit[0]}">${circuit[0]} - ${circuit[1]}</option>
        `
  );
  circuitsList.innerHTML = options;
}

function checkYear() {
  const { value: yearValue } = year;

  if (yearValue >= 2023 && yearValue <= 2025) {
    getYearCircuits();
  } else {
    value = "";
    year.placeholder = "Not a valid year!";
    circuit.innerHTML = `
        <option value="">Select a valid year</option>
        `;
  }
}

function displayDrivers(driversInfo) {
  const firstPlace = document.querySelector("#first");
  const secondPlace = document.querySelector("#second");
  const thirdPlace = document.querySelector("#third");

  const [firstDriver, secondDriver, thirdDriver] = driversInfo;

  firstPlace.classList.add(`border-2`, `border-slate-300`, `bg-yellow-400/20`);
  firstPlace.innerHTML = `
    <div id="info" class="ml-10 md:ml-0 text-center">
        <p class="text-md">Position: ${firstDriver.position}</p>
        <p class="text-md">${firstDriver.full_name}</p>
        <p class="text-md">Team: ${firstDriver.team_name}</p>
        <p class="text-sm">+${firstDriver.points} points</p>
        <p class="text-sm">Time: ${firstDriver.time}</p>
    </div>
    <div id="headshot">
        <img class="ml-2 my-2 md:ml-0" src="${firstDriver.headshot_url}">
    </div>
    `;
  secondPlace.classList.add(`border-2`, `border-slate-300`, `bg-gray-400/20`);
  secondPlace.innerHTML = `
    <div id="info" class="ml-10 md:ml-0 text-center">
        <p class="text-md">Position: ${secondDriver.position}</p>
        <p class="text-md">${secondDriver.full_name}</p>
        <p class="text-md">Team: ${secondDriver.team_name}</p>
        <p class="text-sm">+${secondDriver.points} points</p>
        <p class="text-sm">Time: ${secondDriver.time}</p>
        <p class="text-sm">Gap to 1st: ${secondDriver.gapTo1}</p>
    </div>
    <div id="headshot">
        <img class="ml-2 my-2 md:ml-0" src="${secondDriver.headshot_url}">
    </div>
    `;
  thirdPlace.classList.add(`border-2`, `border-slate-300`, `bg-amber-900/20`);
  thirdPlace.innerHTML = `
    <div id="info" class="ml-10 md:ml-0 text-center">
        <p class="text-md">Position: ${thirdDriver.position}</p>
        <p class="text-md">${thirdDriver.full_name}</p>
        <p class="text-md">Team: ${thirdDriver.team_name}</p>
        <p class="text-sm">+${thirdDriver.points} points</p>
        <p class="text-sm">Time: ${thirdDriver.time}</p>
        <p class="text-sm">Gap to 1st: ${thirdDriver.gapTo1}</p>
    </div>
    <div id="headshot">
        <img class="ml-2 my-2 md:ml-0" src="${thirdDriver.headshot_url}">
    </div>
    `;
}

form.addEventListener("submit", getSession);
year.addEventListener("change", checkYear);
