// server/data.js
const BOARD_SPACES = [
  { id: 0, name: "LOS", type: "corner", action: "go" },
  { id: 1, name: "Badstraße", type: "property", group: "lila", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50 },
  { id: 2, name: "Gemeinschaft", type: "chest" },
  { id: 3, name: "Turmstraße", type: "property", group: "lila", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50 },
  { id: 4, name: "Einkommensteuer", type: "tax", amount: 200 },
  { id: 5, name: "Südbahnhof", type: "railroad", group: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 6, name: "Chausseestraße", type: "property", group: "hellblau", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
  { id: 7, name: "Ereignis", type: "chance" },
  { id: 8, name: "Elisenstraße", type: "property", group: "hellblau", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
  { id: 9, name: "Poststraße", type: "property", group: "hellblau", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50 },
  { id: 10, name: "Gefängnis", type: "corner", action: "jail" },
  { id: 11, name: "Seestraße", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
  { id: 12, name: "Elektrizitätswerk", type: "utility", group: "utility", price: 150, rent: [4, 10] },
  { id: 13, name: "Hafenstraße", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
  { id: 14, name: "Neue Straße", type: "property", group: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100 },
  { id: 15, name: "Westbahnhof", type: "railroad", group: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 16, name: "Münchner Straße", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
  { id: 17, name: "Gemeinschaft", type: "chest" },
  { id: 18, name: "Wiener Straße", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
  { id: 19, name: "Berliner Straße", type: "property", group: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100 },
  { id: 20, name: "Frei Parken", type: "corner", action: "parking" },
  { id: 21, name: "Theaterstraße", type: "property", group: "rot", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
  { id: 22, name: "Ereignis", type: "chance" },
  { id: 23, name: "Museumstraße", type: "property", group: "rot", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
  { id: 24, name: "Opernplatz", type: "property", group: "rot", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150 },
  { id: 25, name: "Nordbahnhof", type: "railroad", group: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 26, name: "Lessingstraße", type: "property", group: "gelb", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
  { id: 27, name: "Schillerstraße", type: "property", group: "gelb", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
  { id: 28, name: "Wasserwerk", type: "utility", group: "utility", price: 150, rent: [4, 10] },
  { id: 29, name: "Goethestraße", type: "property", group: "gelb", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150 },
  { id: 30, name: "Gehe ins Gefängnis", type: "corner", action: "gotojail" },
  { id: 31, name: "Rathausplatz", type: "property", group: "gruen", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
  { id: 32, name: "Hauptstraße", type: "property", group: "gruen", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
  { id: 33, name: "Gemeinschaft", type: "chest" },
  { id: 34, name: "Bahnhofstraße", type: "property", group: "gruen", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200 },
  { id: 35, name: "Hauptbahnhof", type: "railroad", group: "railroad", price: 200, rent: [25, 50, 100, 200] },
  { id: 36, name: "Ereignis", type: "chance" },
  { id: 37, name: "Parkstraße", type: "property", group: "dunkelblau", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200 },
  { id: 38, name: "Zusatzsteuer", type: "tax", amount: 100 },
  { id: 39, name: "Schlossallee", type: "property", group: "dunkelblau", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200 }
];

const CHANCE_CARDS = [
  { text: "Rücke vor bis auf LOS.", action: "advance", target: 0 },
  { text: "Rücke vor bis zur Opernplatz. Wenn du LOS passierst, kassiere €200.", action: "advance", target: 24 },
  { text: "Rücke vor bis zur Seestraße. Wenn du LOS passierst, kassiere €200.", action: "advance", target: 11 },
  { text: "Die Bank zahlt Ihnen eine Dividende von €50.", action: "collect", amount: 50 },
  { text: "Gehe 3 Felder zurück.", action: "move", amount: -3 },
  { text: "Gehe ins Gefängnis. Begib dich direkt dorthin. Gehe nicht über LOS. Ziehe keine €200 ein.", action: "jail" },
  { text: "Fahre zum Südbahnhof. Wenn du LOS passierst, kassiere €200.", action: "advance", target: 5 },
  { text: "Rücke vor bis zur Schlossallee.", action: "advance", target: 39 },
  { text: "Sie wurden zum Vorstandsvorsitzenden gewählt. Zahle jedem Spieler €50.", action: "pay_all", amount: 50 },
  { text: "Ihr Bausparvertrag wird fällig. Kassiere €150.", action: "collect", amount: 150 },
  { text: "Zahle Arztkosten von €50.", action: "pay", amount: 50 }
];

const CHEST_CARDS = [
  { text: "Rücke vor bis auf LOS. Kassiere €200.", action: "advance", target: 0 },
  { text: "Bankfehler zu Ihren Gunsten. Kassiere €200.", action: "collect", amount: 200 },
  { text: "Zahle Arztkosten. Zahle €50.", action: "pay", amount: 50 },
  { text: "Aus Aktienverkauf erhalten Sie €50.", action: "collect", amount: 50 },
  { text: "Gehe ins Gefängnis. Begib dich direkt dorthin. Gehe nicht über LOS. Ziehe keine €200 ein.", action: "jail" },
  { text: "Weihnachtsfonds wird fällig. Kassiere €100.", action: "collect", amount: 100 },
  { text: "Steuerrückerstattung. Kassiere €20.", action: "collect", amount: 20 },
  { text: "Lebensversicherung wird fällig. Kassiere €100.", action: "collect", amount: 100 },
  { text: "Opernabend. Kassiere €50 von jedem Mitspieler.", action: "collect_all", amount: 50 },
  { text: "Es ist Ihr Geburtstag. Kassiere €10 von jedem Mitspieler.", action: "collect_all", amount: 10 },
  { text: "Krankenhauskosten. Zahle €100.", action: "pay", amount: 100 },
  { text: "Schulgebühren. Zahle €150.", action: "pay", amount: 150 },
  { text: "Sie erhalten ein Beratungshonorar. Kassiere €25.", action: "collect", amount: 25 },
  { text: "Sie erben €100.", action: "collect", amount: 100 },
  { text: "Sie haben den zweiten Preis in einem Schönheitswettbewerb gewonnen. Kassiere €10.", action: "collect", amount: 10 }
];

module.exports = {
  BOARD_SPACES,
  CHANCE_CARDS,
  CHEST_CARDS
};

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

module.exports.shuffle = shuffle;
