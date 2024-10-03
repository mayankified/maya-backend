import weaviate from "weaviate-ts-client";

async function createClasses() {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  // Loop to create classes Aug1 to Aug50
  for (let i = 1; i <= 50; i++) {
    const className = `Aug${i}`;

    // Schema configuration for each class
    const schemaConfig = {
      class: className,
      vectorizer: "img2vec-neural",
      vectorIndexType: "hnsw",
      moduleConfig: {
        "img2vec-neural": {
          imageFields: ["image"],
        },
      },
      properties: [
        {
          name: "image",
          dataType: ["blob"],
        },
        {
          name: "text",
          dataType: ["string"],
        },
      ],
    };

    try {
      // Create the class in Weaviate
      const response = await client.schema.classCreator().withClass(schemaConfig).do();
      console.log(`Schema for class ${className} created successfully:`, response);
    } catch (error) {
      console.error(`Error creating schema for class ${className}:`, error.message);
    }
  }
}

createClasses();
