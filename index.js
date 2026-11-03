const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const uri = process.env.MONGODB_URI;

const cors = require("cors");
app.use(cors());
app.use(express.json());

if (!uri) {
  console.error("Falta configurar la variable de entorno MONGODB_URI.");
  process.exitCode = 1;
} else {
  MongoClient.connect(uri, { useUnifiedTopology: true })
    .then((client) => {
      console.log("Conectado a la base de datos");
      const database = client.db("tutorial10");

      app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "index.html"));
      });
      app.use("/js", express.static(path.join(__dirname, "js")));

      app.get("/sensores", async (req, res) => {
        try {
          const sensors = await database
            .collection("sensores")
            .find()
            .toArray();
          res.status(200).send(sensors);
        } catch (error) {
          console.error("Error al consultar los sensores:", error);
          res.status(500).send("No se pudieron consultar los sensores.");
        }
      });

      app.post("/sensores", async (req, res) => {
        const sensorName =
          typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";
        if (!sensorName) {
          return res.status(400).send("El nombre del sensor es obligatorio.");
        }

        try {
          const result = await database
            .collection("sensores")
            .insertOne({ nombre: sensorName });
          res.status(201).send(result.ops[0]);
        } catch (error) {
          console.error("Error al guardar el sensor:", error);
          res.status(500).send("No se pudo guardar el sensor.");
        }
      });

      app.get("/sensores/:sensorId", async (req, res) => {
        const sensorId = req.params.sensorId;
        if (!ObjectId.isValid(sensorId)) {
          return res.status(400).send("El identificador del sensor no es válido.");
        }

        try {
          const sensor = await database
            .collection("sensores")
            .findOne({ _id: new ObjectId(sensorId) });
          if (sensor) {
            res.status(200).send(sensor);
          } else {
            res.status(404).send(`El sensor con id: ${sensorId} no existe`);
          }
        } catch (error) {
          console.error("Error al consultar el sensor:", error);
          res.status(500).send("No se pudo consultar el sensor.");
        }
      });

      app.post("/sensores/:sensorId/mediciones", async (req, res) => {
        const sensorId = req.params.sensorId;
        if (!ObjectId.isValid(sensorId)) {
          return res.status(400).send("El identificador del sensor no es válido.");
        }

        const measurement = req.body;
        try {
          const result = await database
            .collection("sensores")
            .updateOne(
              { _id: new ObjectId(sensorId) },
              { $addToSet: { mediciones: measurement } }
            );
          if (result.matchedCount === 0) {
            return res
              .status(404)
              .send(`El sensor con id: ${sensorId} no existe`);
          }
          res.status(201).send(measurement);
        } catch (error) {
          console.error("Error al guardar la medición:", error);
          res.status(500).send("No se pudo guardar la medición.");
        }
      });

      app.listen(port, () => {
        console.log(`Servidor escuchando en el puerto: ${port}`);
      });
    })
    .catch((error) => {
      console.error("Error al conectar a la base de datos:", error.message);
      process.exitCode = 1;
    });
}
