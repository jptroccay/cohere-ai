import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { CohereClient } from "cohere-ai";

dotenv.config();

const cohere = new CohereClient({
  token: process.env.API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const stream = await cohere.chatStream({
      model: "command",
      message: `${prompt}`,
      chatHistory: [],
      promptTruncation: "AUTO",
      citationQuality: "accurate",
      connectors: [{ id: "web-search" }],
      documents: [],
    });

    let generatedText = "";

    for await (const chat of stream) {
      if (chat.eventType === "text-generation") {
        generatedText += chat.text; // Acumula el texto generado
      }
    }

    res.status(200).send({
      bot: generatedText,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error al procesar la solicitud" });
  }
});

app.listen(5001, () =>
  console.log("Servidor en ejecución en http://localhost:5001")
);
