import weaviate from "weaviate-ts-client";

const client = weaviate.client({
  scheme: "http",
  host: "weaviate:8080",
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
await client.schema.classCreator().withClass(schemaConfig).do();
