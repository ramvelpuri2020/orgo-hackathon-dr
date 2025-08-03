# OrgoGPT Setup Guide

This guide will help you set up the OrgoGPT application with Claude Computer Use integration.

## 🚀 Quick Start

### 1. Environment Setup

Run the setup script to create your environment file:

```bash
npm run setup
```

This will create a `.env.local` file with the required environment variables.

### 2. Get API Keys

You'll need two API keys:

1. **Orgo API Key**: Get one from [https://docs.orgo.ai/quickstart](https://docs.orgo.ai/quickstart)
2. **Anthropic API Key**: Get one from [https://console.anthropic.com/](https://console.anthropic.com/)

### 3. Update Environment Variables

Edit the `.env.local` file and replace the placeholder values:

```env
ORGO_API_KEY=your_actual_orgo_api_key_here
ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 How to Use

### Connecting to Orgo

1. Click the **Orgo Desktop** status indicator in the top-right corner
2. The status will change from "Offline" to "Connecting" to "Online"
3. Once connected, you'll see a project ID badge

### Running Tasks

1. **Type your request** in natural language, for example:
   - "Open Firefox and search for weather"
   - "Create a text file with today's date"
   - "Take a screenshot of the desktop"
   - "Open a web browser and go to google.com"

2. **Click Send** or press Enter to submit your request

3. **View Results**:
   - Text output showing what was accomplished
   - Screenshots of the virtual desktop
   - Task history in the sidebar

### Quick Actions

Use the predefined quick actions for common tasks:
- Open Firefox and search for weather
- Create a text file
- Take a screenshot
- Open a web browser

## 🔧 Current Implementation

### Mock Mode (Development)

The current implementation uses a **mock Orgo service** for development purposes. This means:

- ✅ **UI works perfectly** - All components function as expected
- ✅ **Task management** - Tasks are saved and displayed correctly
- ✅ **Screenshots** - Mock screenshots are generated
- ✅ **Status management** - Connection status updates work
- ⚠️ **No real Orgo** - Tasks are simulated, not executed on real virtual desktops

### Real Orgo Integration

To enable real Orgo integration:

1. **Replace the mock service** in `lib/orgo-service.ts` with the actual Orgo SDK
2. **Update the API calls** to use the real Orgo Computer class
3. **Test with real API keys** to ensure everything works

## 📁 Project Structure

```
orgo-hackathon-dr/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/               # UI components (buttons, cards, etc.)
│   ├── task-input.tsx    # Task input form
│   ├── task-output.tsx   # Task results display
│   ├── task-history.tsx  # Task history sidebar
│   └── orgo-status.tsx   # Orgo connection status
├── lib/                   # Business logic
│   ├── api.ts            # API service (Orgo integration)
│   ├── orgo-service.ts   # Orgo service (currently mock)
│   └── store.ts          # Zustand state management
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## 🔄 State Management

The application uses Zustand for state management:

- **Tasks**: Array of completed/processing tasks
- **Current Task**: Currently selected task
- **Loading State**: Processing status
- **Orgo Connection**: Connection status and project ID

## 🎨 UI Features

- **Dark/Light Mode**: Toggle in the top-right corner
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Status updates every 5 seconds
- **Task History**: Persistent storage of all tasks
- **Screenshot Display**: View results with visual feedback

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to connect"**
   - Check your `ORGO_API_KEY` is correct
   - Ensure you have an active Orgo account

2. **"Failed to process request"**
   - Check your `ANTHROPIC_API_KEY` is correct
   - Verify your Anthropic account has credits

3. **Environment variables not loading**
   - Restart your development server
   - Check the `.env.local` file exists

4. **TypeScript errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for any missing packages

### Getting Help

- [Orgo Documentation](https://docs.orgo.ai/)
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🚀 Next Steps

### For Production

1. **Replace mock service** with real Orgo SDK
2. **Add error handling** for network issues
3. **Implement retry logic** for failed requests
4. **Add user authentication** if needed
5. **Deploy to production** (Vercel, Netlify, etc.)

### For Development

1. **Add more task types** to the mock service
2. **Implement real-time progress** updates
3. **Add keyboard shortcuts** for common actions
4. **Create unit tests** for components
5. **Add E2E tests** with Playwright

## 📝 License

MIT License - feel free to use this code for your own projects! 