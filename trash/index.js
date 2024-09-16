import weaviate from "weaviate-ts-client";
import { readFileSync, writeFileSync } from "fs";
const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

const schemaRes = await client.schema.getter().do();

console.log(schemaRes);

// Function to fetch an image from a URL and store it in Weaviate
async function uploadImageToWeaviate(imageUrl, text) {
  try {
    // Fetch the image from the URL
    const img = readFileSync(imageUrl);
    // Convert the image to a base64 string
    // const b64 = Buffer.from(response.data, "binary").toString("base64");
    const b64 = Buffer.from(img).toString("base64");
    // Upload to Weaviate
    const result = await client.data
      .creator()
      .withClassName("Maya")
      .withProperties({
        image: b64,
        text: text,
      })
      .do();

    console.log("Image uploaded to Weaviate:", result);
  } catch (error) {
    console.error("Error uploading image to Weaviate:", error);
  }
}

async function queryImage(imageUrl) {
  try {
    const test = Buffer.from(readFileSync(imageUrl)).toString("base64");

    const resImage = await client.graphql
      .get()
      .withClassName("Maya")
      .withFields(["image", "text"])
      .withNearImage({ image: test })
      .withLimit(1)
      .do();

    // Write result to filesystem
    const result = resImage.data.Get.Maya[0].image;
    console.log("Image fetched from Weaviate:", resImage.data.Get.Maya[0].text);
    writeFileSync("./result.jpg", result, "base64");
  } catch (error) {
    console.error("Error querying image in Weaviate:", error);
  }
}

// uploadImageToWeaviate("./images/apples.jpeg", "Apples");
// uploadImageToWeaviate("./images/banana.jpeg", "Bananas");
// uploadImageToWeaviate("./images/naruto.jpeg", "Naruto");
// queryImage("./images/apple.jpeg");

// Fetching all objects of a specific class
client.graphql
  .get()
  .withClassName('Maya') // Replace with your class name
  .withFields(['_additional { id }', 'text']) // Specify fields you want to retrieve // Limit the number of results
  .do()
  .then(result => {
    console.log('Fetched Data:', result.data.Get.Maya);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });