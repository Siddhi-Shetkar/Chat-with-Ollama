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
