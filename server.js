const express = require("express");
const app = express();
const PORT = 3000;

const customers = [
  { id: 65010468, name: "Thanyatorn", birthdate: "2003-02-19" },
];

app.use(express.json());

const convert = (response) => response.json();
const url = "https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec";
const logs_url = "https://app-tracking.pockethost.io/api/collections/drone_logs/records";

app.post("/logs", async (req, res) => {
  const rawData = await fetch(logs_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });
  res.send("OK");
});

app.get("/logs", async (req, res) => {
  const rawData = await fetch(logs_url, { method: "GET" });
  const jsonData = await rawData.json();
  const logs = jsonData.items;
  res.send(logs);
});

app.get("/configs/:id", async (req, res) => {
  const id = req.params.id;
  try {
      const rawData = await fetch(url, { method: "GET" });
      if (!rawData.ok) {
          return res.status(500).send({ message: "Error fetching data from external API" });
      }
      const jsonData = await rawData.json();
      const drones = jsonData.data || [];
      const myDrone = drones.find((item) => item.drone_id == id);
      if (!myDrone) {
          return res.status(404).send({ message: "Drone not found" });
      }
      myDrone.max_speed = !myDrone.max_speed ? 100 : myDrone.max_speed;
      myDrone.max_speed = myDrone.max_speed > 110 ? 110 : myDrone.max_speed;
      res.send(myDrone);
  } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
  }
});

app.get("/status/:id", async (req, res) => {
  const id = req.params.id;
  try {
      const rawData = await fetch(url, { method: "GET" });
      if (!rawData.ok) {
          return res.status(500).send({ message: "Error fetching data from external API" });
      }
      const jsonData = await rawData.json();
      const drones = jsonData.data || [];
      const myDrone = drones.find((item) => item.drone_id == id);
      if (!myDrone) {
          return res.status(404).send({ message: "Drone not found" });
      }
      const droneCondition = {
          condition: myDrone.condition,
      };
      res.send(droneCondition);
  } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello API World!");
});

app.get("/customers", (req, res) => {
  res.send(customers);
});

app.get("/customers/:id", (req, res) => {
  const id = req.params.id;
  const myCustomer = customers.find((item) => item.id == id);
  if (!myCustomer) {
    res.status(404).send({ status: "error", message: "Customer not found" });
  } else {
    res.send(myCustomer);
  }
});

app.delete("/customers/:id", (req, res) => {
  const id = req.params.id;
  const index = customers.findIndex((item) => item.id == id);
  customers.splice(index, 1);
  res.send({ status: "success", message: "Customer deleted" });
});

app.post("/customers", (req, res) => {
  const newCustomer = req.body;
  customers.push(newCustomer);
  res.send({ status: "success", message: "Customer created" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
