import weaviate from "weaviate-ts-client";

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080",
});

async function printCurrentDatabase() {
  try {
    const res = await client.graphql
      .get()
      .withClassName("Maya") // Replace "Maya" with your class name
      .withFields(["image", "text", "_additional { id }"]) // Specify the fields you want to retrieve
      .withLimit(100) // Set the limit for how many objects you want to retrieve
      .do();

    // Log the results
    const objects = res.data.Get.Maya;
    if (objects.length === 0) {
      console.log("No objects found in the database.");
    } else {
      console.log("Current database objects:");
      objects.forEach((obj, index) => {
        console.log(`Object ${index + 1}:`);
        console.log(`ID: ${obj._additional.id}`);
        console.log(`Text: ${obj.text}`);
        // console.log(`Image (Base64): ${obj.image}`);
        console.log("-----------------------------");
      });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    throw new Error(`Error querying the database: ${error.message}`);
  }
}

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

await printCurrentDatabase();
const id = await getObjectIdbyText("Naruto");

async function deleteImageById(objectId) {
  try {
    const result = await client.data.deleter().withId(objectId).do();
    console.log("Image deleted from Weaviate:", result);
    return result;
  } catch (error) {
    console.error("Error deleting image from Weaviate:", error);
    throw new Error(`Error deleting image from Weaviate: ${error.message}`);
  }
}

await deleteImageById(id);

await printCurrentDatabase();
