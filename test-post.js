fetch("http://localhost:3000/api/goal", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    itemName: "Test",
    totalValue: 1000,
    months: 12,
    contributionP1: 50,
    nameP1: "A",
    nameP2: "B",
    savedP1: 0,
    savedP2: 0
  })
}).then(r => r.json()).then(console.log).catch(console.error);
