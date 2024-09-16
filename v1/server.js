import express from "express";
import weaviate from "weaviate-ts-client";
import cors from "cors";
import multer from "multer";
import axios from "axios";

const app = express();
app.use(cors());
const port = 3000;

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

// const schemaConfig = {
//   class: "Maya",
//   vectorizer: "img2vec-neural",
//   vectorIndexType: "hnsw",
//   moduleConfig: {
//     "img2vec-neural": {
//       imageFields: ["image"],
//     },
//   },
//   properties: [
//     {
//       name: "image",
//       dataType: ["blob"],
//     },
//     {
//       name: "text",
//       dataType: ["string"],
//     },
//   ],
// };
// await client.schema.classCreator().withClass(schemaConfig).do();

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Middleware to parse JSON bodies
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Function to upload image to Weaviate
async function uploadImageToWeaviate(imageBuffer, text) {
  try {
    const b64 = imageBuffer.toString("base64");
    const result = await client.data
      .creator()
      .withClassName("Maya")
      .withProperties({
        image: b64,
        text: text,
      })
      .do();

    console.log("Image uploaded to Weaviate:", result);
    return result;
  } catch (error) {
    console.error("Error uploading image to Weaviate:", error);
    throw new Error(`Error uploading image to Weaviate: ${error.message}`);
  }
}

// Function to query image in Weaviate
async function queryImage(imageBuffer) {
  try {
    const b64 = imageBuffer.toString("base64");

    const resImage = await client.graphql
      .get()
      .withClassName("Maya")
      .withFields(["image", "text"])
      .withNearImage({ image: b64 })
      .withLimit(1)
      .do();

    const fetchedData = resImage.data.Get.Maya[0];
    const resultText = fetchedData.text;

    console.log("Image fetched from Weaviate:", resultText);

    return { text: resultText };
  } catch (error) {
    console.error("Error querying image in Weaviate:", error);
    throw new Error(`Error querying image in Weaviate: ${error.message}`);
  }
}

// Route to upload image using URL and text
app.post("/upload", async (req, res) => {
  try {
    const { imageUrl, text } = req.body;

    // Fetch the image from the provided URL
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    const result = await uploadImageToWeaviate(imageBuffer, text);
    res.status(200).json({ message: "Image uploaded successfully", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to query image using file upload
app.post("/query", upload.single("image"), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;

    const result = await queryImage(imageBuffer);
    res.status(200).json({ message: "Image queried successfully", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the Express server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
