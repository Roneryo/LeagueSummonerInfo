const championDataURL =
  "http://ddragon.leagueoflegends.com/cdn/12.7.1/data/en_US/champion.json";
const imageChampionURL =
  "http://ddragon.leagueoflegends.com/cdn/12.7.1/img/champion/";

const API_KEY = "RGAPI-b6e40425-3863-4b7a-88ef-96056fd04f12";
const SPLASHART_URL =
  "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/";

let buscar = document.querySelector("#buscar");
let summonerTag = document.querySelector("#TagName");

async function makeRequest(URL) {
  let request = await fetch(URL);
  let parsedData = await request.json();
  return parsedData;
}
async function getMatchDetails(matchId) {
  let URL = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`;
  let dataMatch = await makeRequest(URL);
  return dataMatch;
}
async function getMatches(summonerTagName) {
  const {
    // accountId,
    id,
    // name,
    // profileIconId,
    puuid,
    // revisionDate,
    // summonerLevel,
  } = await getSummonerData(summonerTagName);
  // console.log(id);
  const matchesURL = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`;
  let matches = await makeRequest(matchesURL);
  let matchesDetail = await matches.map(
    async (el) => await getMatchDetails(el)
  );
  matchesDetail = await Promise.all(matchesDetail);
  // console.log(matchesDetail);

  matchesDetail.forEach((element) => {
    console.log(`Modo de Juego -> ${element.info.gameMode}`);
    let xd = element.info.participants.map((el) => {
      let { summonerName, teamId, championName } = el;
      if (teamId === 200) teamId = "Red";
      else teamId = "Blue";
      return { summonerName, teamId, championName };
    });
    // console.table(xd);
    // element.info.participants.forEach((el) => {});
  });
}

async function getDataChampionMastery(summonerTagName) {
  const {
    accountId,
    id,
    name,
    profileIconId,
    puuid,
    revisionDate,
    summonerLevel,
  } = await getSummonerData(summonerTagName);

  const URL = `https://la1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}?api_key=${API_KEY}`;

  let dataChampionMastery = await makeRequest(URL);
  let dataChampion = await makeRequest(championDataURL);
  return {
    dataChampion: dataChampion.data,
    dataChampionMastery: dataChampionMastery,
  };
}
async function dataChampion(summonerTagName) {
  let contenedor = document.querySelector("div#data");
  contenedor.innerHTML = "";
  let infoContainer = document.querySelector("#info .userinfo");
  infoContainer.innerHTML = "";

  let { dataChampion, dataChampionMastery } = await getDataChampionMastery(
    summonerTagName
  );
  let { name, profileIconId, summonerLevel } = await getSummonerData(
    summonerTagName
  );
  let dataRank = await getSummonerRank(summonerTagName);
  // console.log(dataRank);
  // console.log(dataChampionMastery);
  // console.log(dataChampion);

  dataChampionMastery.forEach(async (element, index) => {
    let xd = Object.entries(dataChampion).filter(
      (el) => el[1].key == element.championId
    );
    if (index === 0) {
      let name = xd[0];
      let banner = document.querySelector(".userprofile");
      banner.style.background = `url(${SPLASHART_URL}${name[0]}_0.jpg)`;
      banner.style.backgroundSize = "cover";
      banner.style.backgroundPosition = "center";

      // console.log(index,name[0]);
    }
    let date = new Date(element.lastPlayTime);
    let dateString = date.toLocaleDateString("es-VE");
    console.log(dateString);
    let currentYear = date.getFullYear();
    if (currentYear > 2021) {
      let container = document.createElement("div");
      let infoContainer = document.createElement("div");
      let infoChamp = document.createElement("p");
      let ultimoJuego = document.createElement("p");
      infoContainer.classList='champInfo';
      
      let puntosMaestria= await convertirACantidad(element.championPoints);
      console.log(puntosMaestria);
      

      infoChamp.innerText=`Puntos de Maestria: ${puntosMaestria}`

      ultimoJuego.innerText=`Ultima vez: ${dateString}`;
      infoContainer.appendChild(infoChamp);
      infoContainer.appendChild(ultimoJuego);
      container.classList = "dataChampion";
      
      // let container =
      let image = document.createElement("img");
      console.log(element);

      // image.style.height = "25px";
      image.src = `img/champs/${xd[0][1].id}_0.jpg`;
      container.appendChild(image);
      container.appendChild(infoContainer);
      contenedor.appendChild(container);
    }
  });
  let info = document.createElement("h3");
  let xd = Object.values(dataRank).filter((el) => el.tier);
  // // console.log(xd);
  let imgSrc = await xd.map(
    (el) =>
      `img/rank/${el.tier[0]}${el.tier
        .slice(1, el.tier.length)
        .toLowerCase()}.png`
  );
  let iconImg = document.createElement("img");
  let rankSection = document.createElement("div");
  rankSection.classList = "rankSection";
  iconImg.src = `https://ddragon.leagueoflegends.com/cdn/12.7.1/img/profileicon/${profileIconId}.png`;
  iconImg.classList = "icon";
  // let rankUrlImage = imgSrc[0];
  // console.log(imgSrc);

  // // console.log(rankUrlImage);
  // rankImg.src=rankUrlImage;
  // iconImg.style.height="50px";
  info.innerText = `${name}`;
  info.classList = "summoner";
  infoContainer.appendChild(iconImg);
  infoContainer.appendChild(info);
  console.log(xd);
  try {
    imgSrc.forEach((el, i) => {
      let rankContainer = document.createElement("div");
      let rankInfo = document.createElement("div");
      let rankStatus = document.createElement("p");
      let queue = document.createElement("p");

      let win = document.createElement("p");
      let lose = document.createElement("p");
      let char = document.createElement("canvas");
      let winRate = document.createElement("p");

      let winGames = xd[i].wins;
      let loseGames = xd[i].losses;
      let totalGames = winGames+loseGames;
      winRate.innerText=`WinRate:${Math.floor((winGames/totalGames)*100)}%`;
      let charContainer = document.createElement("div");
      charContainer.classList = "chart";
      win.innerText = `Wins: ${winGames}`;
      lose.innerText = `Losses: ${loseGames}`;

      rankInfo.classList = "rankInfo";
      rankInfo.appendChild(win);
      char.id = xd[i].queueType === "RANKED_SOLO_5x5" ? "SoloQ" : "Flex";
      // console.log(char);
      let ctx = char.getContext("2d");
      let myChart;
      let data = {
        labels: ["Wins", "Loses"],
        datasets: [
          {
            label: "Winrate",
            data: [xd[i].wins, xd[i].losses],
            backgroundColor: ["rgb(54, 162, 235)", "rgb(255, 99, 132)"],
            hoverOffset: 4,
          },
        ],
      };

      myChart = new Chart(ctx, {
        type: "doughnut",
        data: data,
      });
      charContainer.appendChild(char);

      rankInfo.appendChild(lose);

      rankStatus.innerText = `${xd[i].tier[0]}${xd[i].tier
        .slice(1, xd[i].tier.length)
        .toLowerCase()} ${
        !xd[i].tier.includes("CHALLENGER" || "GRANDMASTER" || "MASTER")
          ? xd[i].rank
          : ""
      }`;
      rankInfo.appendChild(winRate);
      
      rankContainer.classList = "rankContainer";
      console.log(xd[i].queueType);
      let dataQueue = xd[i].queueType === "RANKED_SOLO_5x5" ? "SoloQ" : "Flex";
      queue.innerText = `${dataQueue}`;
      let rankImg = document.createElement("img");
      rankImg.src = el;

      rankContainer.appendChild(rankImg);
      rankContainer.appendChild(queue);
      rankContainer.appendChild(rankStatus);
      rankContainer.appendChild(rankInfo);
      rankContainer.appendChild(charContainer);
      rankSection.appendChild(rankContainer);
    });
  } catch (e) {
    console.log(e);
  }
  infoContainer.appendChild(rankSection);
  // infoContainer.appendChild(rankImg);
  // await getMatches(summonerTagName);
}
async function getSummonerData(summonerTagName) {
  let summonerURL = `https://la1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerTagName}?api_key=${API_KEY}`;
  let summonerData = await makeRequest(summonerURL);
  return summonerData;
}
async function getSummonerRank(summonerTagName) {
  let { id } = await getSummonerData(summonerTagName);
  const URL = `https://la1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${API_KEY}`;
  return await makeRequest(URL);
}
async function convertirACantidad(puntosMaestria){

  let cantidad = puntosMaestria.toString();
  let tamano = cantidad.length;
  let ndiv = tamano/3;
  let result='';
  for(let i=tamano;i>=0;i-=3){
      if(i-3>0)
          result+=`.${cantidad.slice(i-3,i)}`;
      else
          result = cantidad.slice(0,i).concat(result)
  }
  return result;
}

summonerTag.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    dataChampion(summonerTag.value);
  }
});
buscar.addEventListener("click", () => {
  // console.log("xd");
  dataChampion(summonerTag.value);
});

dataChampion("joker was here");
