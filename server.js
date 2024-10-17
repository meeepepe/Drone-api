const express = require("express");
const app = express();
const PORT = 3000;

// Sample customer data
const customers = [
  { id: 1234, name: "Steven Adams", birthdate: "1980-01-02" },
  { id: 5678, name: "James Lukather", birthdate: "1980-01-02" },
];

// Middleware to parse JSON bodies
app.use(express.json());


// URLs for external APIs
const convert = (response) => response.json();
const url = "https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec";
const logs_url = "https://app-tracking.pockethost.io/api/collections/drone_logs/records";

// POST /logs to send drone logs
app.post("/logs", async (req, res) => {
  console.log("Posting log data");
  console.log(req.body);
  const rawData = await fetch(logs_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });
  res.send("OK");
});

// GET /logs to fetch drone logs
app.get("/logs", async (req, res) => {
  console.log("/logs");
  const rawData = await fetch(logs_url, { method: "GET" });
  const jsonData = await rawData.json();
  const logs = jsonData.items;
  res.send(logs);
});

// GET /config/:id to fetch drone configuration by id
app.get("/configs/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`Fetching config for ID: ${id}`); // Log the requested ID
  try {
      const rawData = await fetch(url, { method: "GET" });
      if (!rawData.ok) {
          console.error(`Error fetching data from external API: ${rawData.status} ${rawData.statusText}`);
          return res.status(500).send({ message: "Error fetching data from external API" });
      }
      
      const jsonData = await rawData.json();
      console.log("Fetched data:", jsonData); // Log the fetched data

      const drones = jsonData.data || [];
      const myDrone = drones.find((item) => item.drone_id == id);

      if (!myDrone) {
          return res.status(404).send({ message: "Drone not found" });
      }

      myDrone.max_speed = !myDrone.max_speed ? 100 : myDrone.max_speed;
      myDrone.max_speed = myDrone.max_speed > 110 ? 110 : myDrone.max_speed;

      res.send(myDrone);
  } catch (error) {
      console.error("Error fetching drone config:", error);
      res.status(500).send({ message: "Internal Server Error" });
  }
});






// Sample endpoint to return a greeting message
app.get("/", (req, res) => {
  res.send("Hello API World!");
});

// GET /customers to return all customers
app.get("/customers", (req, res) => {
  res.send(customers);
});

// GET /customers/:id to fetch customer by ID
app.get("/customers/:id", (req, res) => {
  const id = req.params.id;
  const myCustomer = customers.find((item) => item.id == id);

  if (!myCustomer) {
    res.status(404).send({ status: "error", message: "Customer not found" });
  } else {
    res.send(myCustomer);
  }
});

// DELETE /customers/:id to delete a customer by ID
app.delete("/customers/:id", (req, res) => {
  const id = req.params.id;
  const index = customers.findIndex((item) => item.id == id);
  customers.splice(index, 1);

  res.send({ status: "success", message: "Customer deleted" });
});

// POST /customers to create a new customer
app.post("/customers", (req, res) => {
  const newCustomer = req.body;
  customers.push(newCustomer);
  res.send({ status: "success", message: "Customer created" });
});

// Start the server on the specified PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
