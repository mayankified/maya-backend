import weaviate from "weaviate-ts-client";

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});
const schemaConfig = {
  class: "Maya",
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
const response=await client.schema.classCreator().withClass(schemaConfig).do();

console.log("Schema created");
console.log(response);
