import weaviate from "weaviate-ts-client";

async function deleteAllClasses() {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  try {
    // Get all existing classes
    const schema = await client.schema.getter().do();
    const classes = schema.classes;

    // Loop through all classes and delete them
    for (let classInfo of classes) {
      const className = classInfo.class;
      try {
        await client.schema.classDeleter().withClassName(className).do();
        console.log(`Class ${className} deleted successfully.`);
      } catch (error) {
        console.error(`Error deleting class ${className}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Error fetching schema classes:", error.message);
  }
}

deleteAllClasses();
