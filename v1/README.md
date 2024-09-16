Here's a README file in Markdown format for your backend code with detailed instructions:

```markdown
# Backend Service

This is the backend service for interacting with Weaviate and handling image uploads and queries.

## Getting Started

Follow these instructions to get the backend service up and running on your local machine using Docker.

### Prerequisites

- Docker
- Docker Compose
- Node.js (for running scripts locally if needed)

### Installation and Setup

1. **Clone the Repository**

   Clone this repository to your local machine.

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Build and Start Services with Docker Compose**

   Run the following command to build and start the services defined in `docker-compose.yml`.

   ```bash
   sudo docker-compose up -d
   ```

   This command will build the Docker images and start the services in detached mode.

3. **Run Initialization Script (`utils.js`)**

   The `utils.js` script needs to be run only once to perform any necessary initialization tasks.

   ```bash
   node utils.js
   ```

   This script will initialize the Weaviate schema or other tasks required before starting the server.

4. **Start the Server**

   Start the Node.js server with the following command:

   ```bash
   node server.js
   ```

   The server will start on port `3000`.

5. **Access the Application**

   Once the server is running, you can access the application via:

   ```
   http://localhost:3000
   ```

### API Endpoints

- `POST /upload`
  - Upload an image using a URL and associate it with a text description.
  - **Request Body:** `{ "imageUrl": "<URL>", "text": "<Description>" }`
  - **Response:** Returns a message indicating the success of the upload.

- `POST /query`
  - Query an image by uploading it directly to find similar images in Weaviate.
  - **Form Data:** `image` (file)
  - **Response:** Returns the text associated with the queried image.

### Important Notes

- Ensure that Docker and Docker Compose are installed and running on your system.
- The `utils.js` script should only be run once during the initial setup to avoid reinitializing the schema.
- If you make any changes to the codebase, you may need to rebuild the Docker images using:

  ```bash
  sudo docker-compose up --build -d
  ```

### Stopping the Services

To stop the services, run:

```bash
sudo docker-compose down
```

This will stop and remove the containers.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Acknowledgments

- [Weaviate](https://weaviate.io/) for providing the vector search engine used in this project.
- [Express](https://expressjs.com/) for the web framework.
```

### How to Use:
1. **Copy the above text** and save it as `README.md` in the root directory of your project.
2. **Customize the sections** as needed, such as adding a repository URL and any other specific instructions relevant to your project.