import weaviate from "weaviate-ts-client";

async function listAllClasses() {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });

  try {
    // Get all existing classes
    const schema = await client.schema.getter().do();
    const classes = schema.classes;

    // Print all class names
    const classNames = classes.map((classInfo) => classInfo.class);
    console.log("Class names in Weaviate:", classNames);
    return classNames;
  } catch (error) {
    console.error("Error fetching schema classes:", error.message);
  }
}

listAllClasses();
