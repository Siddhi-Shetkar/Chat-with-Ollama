# Ollama AI Chat Application

A full-stack, ChatGPT-like web application that interacts with a local Ollama model.

## Features

- **Modern UI**: Clean, ChatGPT-inspired interface built with React and Tailwind CSS.
- **Local AI Integration**: Connects seamlessly to a locally running Ollama instance.
- **Model Selection**: Switch between available Ollama models dynamically from the sidebar.
- **Conversation History**: Maintains conversation history within a session and allows clearing it.
- **Markdown & Syntax Highlighting**: Rich rendering of AI responses, including code blocks with syntax highlighting.
- **Responsive Design**: Works perfectly on both desktop and mobile devices.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Axios, Lucide React (Icons), React Markdown, Rehype Highlight.
- **Backend**: Node.js, Express.js, Axios.
- **AI Backend**: Local Ollama (http://localhost:11434).

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Ollama**: You must have Ollama installed and running on your local machine.
   - Download from [Ollama.com](https://ollama.com/)
   - Pull at least one model (e.g., `ollama run llama3` or `ollama run mistral`)

## Installation & Setup

1. **Clone or Extract the repository.**
2. **Setup the Backend**:
   ```bash
   cd server
   npm install
   ```
   Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`.

3. **Setup the Frontend**:
   Open a new terminal.
   ```bash
   cd client
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will typically run on `http://localhost:5173`.

4. **Verify Ollama Connection**:
   Make sure Ollama is running (`http://localhost:11434` should be accessible or respond to API calls). If it's running, you will see a green dot in the sidebar indicating "Connected to Ollama".

## Troubleshooting

- **Ollama Disconnected**: Ensure the Ollama background process is running on your system. You can test it by going to `http://localhost:11434` in your browser (it should say "Ollama is running").
- **CORS Issues with Ollama**: If you have issues connecting directly to Ollama, ensure you're using this backend intermediary which resolves CORS and acts as a proxy.
- **Port Conflicts**: If port 5000 is used by another service, change the `PORT` variable in `server/.env` and update the `API_URL` in `client/src/services/api.js`.
