import weaviate from "weaviate-ts-client";

const client = weaviate.client({
  scheme: "http",
  host: "localhost:8080", // Update if you're running Weaviate on a different host/port
});

async function fetchAug1Texts() {
  try {
    // Query all objects in the Aug1 class
    const result = await client.graphql
      .get()
      .withClassName("Aug1")
      .withFields(["text"])
      .do();

    // Check if we have any results
    const data = result.data.Get.Aug1;
    if (data.length === 0) {
      console.log("No text entries found in Aug1 class.");
      return;
    }

    // Loop through and print the text from each object
    data.forEach((item, index) => {
      console.log(`Item ${index + 1}: ${item.text}`);
    });
  } catch (error) {
    console.error("Error fetching texts from Aug1 class:", error);
  }
}

// Run the function
fetchAug1Texts();
