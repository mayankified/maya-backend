import express from "express";
import weaviate from "weaviate-ts-client";
import cors from "cors";
import multer from "multer";
import axios from "axios";
import sharp from "sharp";

const app = express();
app.use(cors());
const port = 3000;

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});
// const client = weaviate.client({
//   scheme: 'https',
//   host: 'es6nljentvkn9ftwtpqsw.c0.asia-southeast1.gcp.weaviate.cloud',
//   apiKey: 'reAV8TuH457Vx0Waq0hYoFEY8bNVrYz3nKox',
// });

console.log("Client started");

export async function getObjectIdbyText(text) {
  try {
    const res = await client.graphql
      .get()
      .withClassName("Maya")
      .withFields(["_additional { id }"])
      .withWhere({
        path: ["text"],
        operator: "Equal",
        valueText: text,
      })
      .withLimit(1)
      .do();

    if (res.data.Get.Maya.length === 0) {
      throw new Error("No object found with the given text");
    }
    const objectId = res.data.Get.Maya[0]._additional.id;
    console.log("Object ID fetched from Weaviate:", objectId);
    return objectId;
  } catch (error) {
    console.error("Error fetching object ID from Weaviate:", error);
    throw new Error(`Error fetching object ID from Weaviate: ${error.message}`);
  }
}

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

async function compressImage(imageBuffer) {
  return await sharp(imageBuffer)
    .resize(500) // Resize image to a width of 500px, maintaining aspect ratio
    .toBuffer();
}

// Function to upload image to Weaviate
async function uploadImageToWeaviate(imageBuffer, text) {
  try {
    const b64 = imageBuffer.toString("base64");
    console.log("Image converted to base64");
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
    console.log("Image converted to base64");
    const resImage = await client.graphql
      .get()
      .withClassName("Maya")
      .withFields([
        "image", 
        "text", 
        "_additional { certainty, distance }" // Include certainty and distance in the response
      ])
      .withNearImage({ image: b64 })
      .withLimit(1)
      .do();
      
    console.log("Image queried from Weaviate");
    const fetchedData = resImage.data.Get.Maya[0];
    const resultText = fetchedData.text;
    const certaintyScore = fetchedData._additional.certainty;
    const distanceScore = fetchedData._additional.distance;

    console.log("Image fetched from Weaviate with similarity scores:");
    console.log(`Text: ${resultText}`);
    console.log(`Certainty: ${certaintyScore}`);
    console.log(`Distance: ${distanceScore}`);

    return { text: resultText, certainty: certaintyScore, distance: distanceScore };
  } catch (error) {
    console.error("Error querying image in Weaviate:", error);
    throw new Error(`Error querying image in Weaviate: ${error.message}`);
  }
}

async function deleteImageById(objectId) {
  try {
    await client.data.deleter().withId(objectId).do();
    console.log("Image deleted from Weaviate");
  } catch (error) {
    console.error("Error deleting image from Weaviate:", error);
    throw new Error(`Error deleting image from Weaviate: ${error.message}`);
  }
}

// Route to upload image using URL and text
app.post("/upload", async (req, res) => {
  try {
    const { imageUrl, text } = req.body;

    // Fetch the image from the provided URL
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");

    // const compressedImage = await compressImage(imageBuffer);
    // console.log("Image compressed");
    console.log("Image fetched from URL");
    const result = await uploadImageToWeaviate(imageBuffer, text);
    res.status(200).json({ message: "Image uploaded successfully", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/delete", async (req, res) => {
  try {
    const { text } = req.body;
    console.log("Text to delete:", text);
    const objectId = await getObjectIdbyText(text);
    const result = await deleteImageById(objectId);
    res.status(200).json({ message: "Image deleted successfully", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to query image using file upload
app.post("/query", upload.single("image"), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    // const compressedImage = await compressImage(imageBuffer);
    // console.log("Image compressed for query");
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
