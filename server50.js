import express from "express";
import weaviate from "weaviate-ts-client";
import cors from "cors";
import multer from "multer";
import axios from "axios";
// import sharp from "sharp";

const app = express();
app.use(cors());
const port = 3000;

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

async function compressImage(imageBuffer) {
  return await sharp(imageBuffer)
    .resize(500) // Resize image to a width of 500px, maintaining aspect ratio
    .toBuffer();
}

// Function to upload image to Weaviate
async function uploadImageToWeaviate(className, imageBuffer, text) {
  try {
    const b64 = imageBuffer.toString("base64");
    console.log("Image converted to base64");
    const result = await client.data
      .creator()
      .withClassName(className)
      .withProperties({
        image: b64,
        text: text,
      })
      .do();
    console.log(`Image uploaded to Weaviate class ${className}:`, result);
    return result;
  } catch (error) {
    console.error(`Error uploading image to Weaviate class ${className}:`, error);
    throw new Error(`Error uploading image to Weaviate: ${error.message}`);
  }
}

// Function to query image in Weaviate
async function queryImage(className, imageBuffer) {
  try {
    const b64 = imageBuffer.toString("base64");
    console.log("Image converted to base64");
    const resImage = await client.graphql
      .get()
      .withClassName(className)
      .withFields([
        "image",
        "text",
        "_additional { certainty, distance }",
      ])
      .withNearImage({ image: b64 })
      .withLimit(1)
      .do();

    console.log(`Image queried from Weaviate class ${className}`);
    const fetchedData = resImage.data.Get[className][0];
    const resultText = fetchedData.text;
    const certaintyScore = fetchedData._additional.certainty;
    const distanceScore = fetchedData._additional.distance;

    console.log("Image fetched from Weaviate with similarity scores:");
    console.log(`Text: ${resultText}`);
    console.log(`Certainty: ${certaintyScore}`);
    console.log(`Distance: ${distanceScore}`);

    return { text: resultText, certainty: certaintyScore, distance: distanceScore };
  } catch (error) {
    console.error(`Error querying image in Weaviate class ${className}:`, error);
    throw new Error(`Error querying image in Weaviate: ${error.message}`);
  }
}

async function deleteImageById(className, objectId) {
  try {
    await client.data.deleter().withId(objectId).do();
    console.log(`Image deleted from Weaviate class ${className}`);
  } catch (error) {
    console.error(`Error deleting image from Weaviate class ${className}:`, error);
    throw new Error(`Error deleting image from Weaviate: ${error.message}`);
  }
}

export async function getObjectIdbyText(className, text) {
  try {
    const res = await client.graphql
      .get()
      .withClassName(className)
      .withFields(["_additional { id }"])
      .withWhere({
        path: ["text"],
        operator: "Equal",
        valueText: text,
      })
      .withLimit(1)
      .do();

    if (res.data.Get[className].length === 0) {
      throw new Error("No object found with the given text");
    }
    const objectId = res.data.Get[className][0]._additional.id;
    console.log(`Object ID fetched from Weaviate class ${className}:`, objectId);
    return objectId;
  } catch (error) {
    console.error(`Error fetching object ID from Weaviate class ${className}:`, error);
    throw new Error(`Error fetching object ID from Weaviate: ${error.message}`);
  }
}

// Loop to create routes for classes Aug1 to Aug50
for (let i = 1; i <= 500; i++) {
  const className = `Aug${i}`;

  // Route to upload image using URL and text
  app.post(`/${className}/upload`, async (req, res) => {
    try {
      console.log(`Route called: /${className}/upload`);
      const { imageUrl, text } = req.body;

      // Fetch the image from the provided URL
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data, "binary");

      console.log("Image fetched from URL");
      const result = await uploadImageToWeaviate(className, imageBuffer, text);
      res.status(200).json({ message: "Image uploaded successfully", result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Route to query image using file upload
  app.post(`/${className}/query`, upload.single("image"), async (req, res) => {
    try {
      console.log(`Route called: /${className}/query`);
      const imageBuffer = req.file.buffer;
      const result = await queryImage(className, imageBuffer);
      res.status(200).json({ message: "Image queried successfully", result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Route to delete image by text
  app.post(`/${className}/delete`, async (req, res) => {
    try {
      console.log(`Route called: /${className}/delete`);
      const { text } = req.body;
      console.log("Text to delete:", text);
      const objectId = await getObjectIdbyText(className, text);
      await deleteImageById(className, objectId);
      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

app.get("/", (req, res) => {
  console.log("Route called: /");
  res.send("Hello World!");
});

// Start the Express server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});
