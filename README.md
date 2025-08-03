# OrgoGPT - AI Computer Assistant

A modern web interface for Orgo's AI computer assistant, built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   node setup-env.js
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure API Keys**
   - Get your Orgo API key from: https://docs.orgo.ai/quickstart
   - Get your Anthropic API key from: https://console.anthropic.com/
   - Update the `.env.local` file with your actual API keys

4. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Recent Fixes (Latest Update)

### Fixed Issues
- **404 Loop Elimination**: Implemented proper error handling with status code checking instead of fragile string matching
- **VM Readiness**: Added explicit `waitUntilReady()` calls before any prompt operations to ensure stable agent loops
- **Project ID Validation**: Fixed validation logic to prevent 'new' from being treated as a reusable project ID
- **Duplicate VM Prevention**: Consolidated fallback logic to prevent accidental double-creation of projects
- **Error Surfacing**: Improved error handling to surface backend errors in the UI instead of hiding them in console logs
- **Project ID Persistence**: Added proper localStorage utilities for project ID management
- **Client-Server Separation**: Fixed `fs` module bundling error by properly separating server-side and client-side code

### Key Improvements
1. **Backend Route (`app/api/orgo/route.ts`)**:
   - Uses improved `connectToProject()` helper with proper error handling
   - Ensures VM readiness before processing requests
   - Proper status code checking for 404 errors

2. **Server Utils (`server/orgo-server.ts`)**:
   - Server-side only module that imports the `orgo` package
   - Fixed project ID validation to reject 'new' as reusable
   - Improved error handling with proper API error checking
   - Extended timeout for VM readiness (3 minutes)

3. **Client Utils (`lib/orgo-client-utils.ts`)**:
   - Client-side only utilities that don't import the `orgo` package
   - Storage utilities for project ID persistence
   - Project ID validation for client-side use

4. **Client Hook (`hooks/use-orgo.ts`)**:
   - Removed retry logic to rely on backend error handling
   - Improved error surfacing to UI
   - Better connection state management

5. **Project ID Debug (`lib/project-id-debug.ts`)**:
   - Fixed validation to treat 'new' as stale/invalid
   - Improved project ID status checking

6. **Store (`lib/store.ts`)**:
   - Uses new client-side storage utilities for project ID management
   - Better integration with localStorage

7. **Webpack Configuration (`next.config.mjs`)**:
   - Added fallback configuration to prevent Node.js module bundling errors
   - Prevents `fs`, `path`, and other Node.js modules from being bundled in client code

### Usage Pattern
The application now follows the official Orgo lifecycle:
```typescript
// Backend: Proper connection flow
const { computer, projectId } = await connectToProject(apiKey, projectId)
await waitUntilReady(computer) // Critical for stability
await computer.prompt(instruction)
```

## 🎯 Features

- **Real-time AI Computer Control**: Interact with a virtual computer using natural language
- **Screenshot Capture**: Automatic screenshots of completed tasks
- **Task History**: View and manage your task history
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes
- **Error Handling**: Robust error handling and user feedback
- **Project Persistence**: Maintains session state across browser refreshes

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand with persistence
- **AI Integration**: Orgo SDK for computer automation
- **API**: Anthropic Claude for natural language processing

## 📁 Project Structure

```
orgo-hackathon-dr/
├── app/                    # Next.js app directory
│   ├── api/orgo/          # Backend API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── orgo-status.tsx   # Connection status component
│   ├── task-input.tsx    # Task input component
│   └── task-output.tsx   # Task output display
├── hooks/                # Custom React hooks
│   └── use-orgo.ts       # Orgo integration hook
├── lib/                  # Client-side utility libraries
│   ├── orgo-client-utils.ts # Client-side Orgo utilities
│   ├── orgo-client.ts    # API client
│   ├── store.ts          # State management
│   └── utils.ts          # General utilities
├── server/               # Server-side only modules
│   └── orgo-server.ts    # Server-side Orgo utilities
└── public/               # Static assets
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Failures**
   - Ensure your API keys are correctly set in `.env.local`
   - Check that your Orgo API key has sufficient credits
   - Verify internet connectivity

2. **404 Errors**
   - The application now properly handles 404s by creating new projects
   - Stale project IDs are automatically cleared
   - Check the browser console for detailed error messages

3. **VM Timeout Issues**
   - VM readiness timeout has been increased to 3 minutes
   - Ensure stable internet connection during VM startup
   - Check Orgo service status at https://status.orgo.ai

4. **Project ID Issues**
   - Invalid project IDs are automatically detected and cleared
   - New sessions are created when previous ones can't be restored
   - Project ID persistence is handled automatically

5. **Module Resolution Errors**
   - The application now properly separates server-side and client-side code
   - Node.js modules like `fs` are not bundled in client code
   - Webpack fallback configuration prevents bundling errors

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment.

## 📚 API Reference

### Backend API Endpoints

- `POST /api/orgo` - Main API endpoint
  - `action: 'connect'` - Connect to Orgo VM
  - `action: 'disconnect'` - Disconnect from VM
  - `action: 'process'` - Process a task
  - `action: 'status'` - Get connection status

### Client Hook

```typescript
const { 
  isConnected, 
  projectId, 
  error, 
  connect, 
  disconnect, 
  processRequest 
} = useOrgo()
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Orgo Documentation](https://docs.orgo.ai)
- [Anthropic Console](https://console.anthropic.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)