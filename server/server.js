const express = require("express");
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());

// 🔴 PUT YOUR REAL TWILIO DETAILS HERE

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
