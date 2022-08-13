
async function update() {
  //
}

window.onload = async function () {
    document.getElementById("answer").focus();
//   const storage = window.localStorage;

//   // Get the names of the input circuits (from cache or query API)
//   model.inputNames = JSON.parse(storage.getItem('inputNames'));
//   if (!model.inputNames) {
//     const series = (await fetchJson('/query?show=series')).series;
//     model.inputNames = series.map((input) => input.name);
//     storage.setItem('inputNames', JSON.stringify(model.inputNames));
//   }

//   //await simulate();

//   // Read current power use per circuit
//   await update();

//   // Load history (asynchronously), then start reading current values regularly
//   window.setTimeout(history, 1);

//   // Start timer to update current values once history loaded
//   window.setInterval(update, 1000);
};