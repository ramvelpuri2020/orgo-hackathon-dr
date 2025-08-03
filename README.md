# OrgoGPT Frontend

A modern web interface for interacting with Orgo's AI computer use platform. This application provides a user-friendly way to control virtual desktop environments using AI agents.

## Features

- 🤖 **AI Computer Control** - Use natural language to control virtual desktops
- 🖥️ **Real-time Status** - Monitor your Orgo desktop status in real-time
- 📱 **Modern UI** - Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🔄 **Task History** - Keep track of all your AI interactions
- 🌙 **Dark Mode** - Toggle between light and dark themes

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Orgo API Key](https://www.orgo.ai/) - Get your API key from the Orgo dashboard

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd orgo-hackathon-dr
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Orgo API key:
   ```env
   NEXT_PUBLIC_ORGO_API_KEY=your_orgo_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Create a Project** - The app will automatically create an Orgo project when you submit your first task
2. **Describe Your Task** - Use natural language to describe what you want the AI to do on the desktop
3. **Watch It Work** - The AI will control the virtual desktop to complete your request
4. **View Results** - See the output and any screenshots from the AI's actions

## Example Tasks

- "Open Firefox and search for weather in New York"
- "Create a text file on the desktop with the current date"
- "Take a screenshot of the desktop"
- "Check system information and display it"

## API Integration

This app integrates with the [Orgo API](https://docs.orgo.ai/) to provide:

- **Project Management** - Create, start, stop, and delete virtual desktop projects
- **Computer Control** - Mouse clicks, keyboard input, screenshots, and more
- **AI Integration** - Use Claude to control computers with natural language
- **Real-time Status** - Monitor desktop status and health

## Development

### Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── orgo-status.tsx # Orgo desktop status
│   ├── task-input.tsx  # Task input form
│   └── task-output.tsx # Task results display
├── lib/                # Utilities and services
│   ├── api.ts          # Orgo API integration
│   └── store.ts        # State management
└── styles/             # Global styles
```

### Key Components

- **OrgoApiService** - Handles all communication with the Orgo API
- **OrgoStatus** - Real-time desktop status monitoring
- **TaskInput** - Natural language task input with quick actions
- **TaskOutput** - Displays AI task results and screenshots

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ORGO_API_KEY` | Your Orgo API key | Yes |
| `NEXT_PUBLIC_ORGO_BASE_URL` | Orgo API base URL | No (defaults to https://www.orgo.ai/api) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

- [Orgo Documentation](https://docs.orgo.ai/)
- [Orgo API Reference](https://docs.orgo.ai/api-reference)
- [Get an API Key](https://www.orgo.ai/)