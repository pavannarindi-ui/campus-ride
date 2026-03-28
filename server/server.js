const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(express.json());

// 🔴 PUT YOUR REAL TWILIO DETAILS HERE
const client = twilio("AC0a85e32951dd979aaecad969673b49eb", "495af9fb8bff80480a78d70a754a65dc");


app.post("/send-sms", async (req, res) => {
  const { phone, message } = req.body;

  try {
    await client.messages.create({
      body: message,
      from: "9032298059",
      to: phone,
    });

    res.status(200).send("SMS Sent");
  } catch (error) {
    console.error(error);
    res.status(500).send("SMS Failed");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
