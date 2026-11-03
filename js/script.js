async function getSensor() {
  const ul = document.getElementById("sensor-list");
  ul.innerHTML = "";
  try {
    const response = await fetch("/sensores");
    if (!response.ok) {
      throw new Error(`Error del servidor (${response.status})`);
    }

    const sensors = await response.json();
    sensors.forEach((sensor) => {
      const li = document.createElement("li");
      li.className = "mdl-list__item";
      const span = document.createElement("span");
      span.className = "mdl-list__item-primary-content";
      const icon = document.createElement("i");
      icon.className = "material-icons mdl-list__item-icon";
      icon.appendChild(document.createTextNode("memory"));
      span.appendChild(icon);
      span.appendChild(document.createTextNode(sensor.nombre));
      li.appendChild(span);
      ul.appendChild(li);
    });
  } catch (error) {
    console.error("No se pudieron cargar los sensores:", error);
    const li = document.createElement("li");
    li.className = "mdl-list__item";
    li.textContent =
      "No se pudieron cargar los sensores. Comprueba el servidor y la base de datos.";
    ul.appendChild(li);
  }
}

async function createSensor(sensorName) {
  const name = sensorName.trim();
  const snackbar = document.querySelector("#mensaje-interactivo");
  if (!name) {
    snackbar.MaterialSnackbar.showSnackbar({
      message: "Escribe el nombre del sensor."
    });
    return;
  }

  try {
    const response = await fetch("/sensores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: name })
    });
    if (!response.ok) {
      throw new Error(`Error del servidor (${response.status})`);
    }

    const sensor = await response.json();
    snackbar.MaterialSnackbar.showSnackbar({
      message: "Sensor agregado - id: " + sensor._id
    });
    document.getElementById("sensor-name").value = "";
    getSensor();
  } catch (error) {
    console.error("No se pudo agregar el sensor:", error);
    snackbar.MaterialSnackbar.showSnackbar({
      message:
        "No se pudo agregar el sensor. Comprueba el servidor y la base de datos."
    });
  }
}

// Toma el evento del menú para mostrar un contenido u otro
function viewPage(page) {
  if (page === "page-sensor-list") {
    document.getElementById("page-sensor-list").style.display = "inline";
    document.getElementById("page-sensor-add").style.display = "none";
    getSensor();
  } else {
    document.getElementById("page-sensor-list").style.display = "none";
    document.getElementById("page-sensor-add").style.display = "inline";
  }
}

// Cuando la aplicación se haya cargado pide los sensores desde el servidor
window.addEventListener("load", function () {
  getSensor();
  document.getElementById("btn-sensor-add").addEventListener("click", () => {
    createSensor(document.getElementById("sensor-name").value);
  });
  viewPage("page-sensor-list");
});
