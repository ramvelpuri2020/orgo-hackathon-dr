# Project ID Behavior

## How Project IDs Work

### Initial Connection
- When you first connect, the app creates a new Orgo computer
- The project ID is saved in local storage
- This ID persists across browser sessions

### Reconnection
- When you click "Offline" to reconnect, the app tries to use the saved project ID
- If the project still exists, it connects to the same computer
- If the project was deleted or expired, it creates a new computer with a new ID

### Project ID Storage
- Project IDs are stored in the browser's local storage
- They persist until you clear your browser data
- The app automatically manages project ID updates

### Error Handling
- **Project Not Found (404)**: Creates new project, updates stored ID
- **Quota Exceeded (403)**: Shows error, requires manual cleanup
- **Network Errors**: Retries connection with same project ID

## Debugging

To see what's happening with project IDs:

1. Open browser developer tools (F12)
2. Check the Console tab for connection logs
3. Look for messages like:
   - "Connecting with project ID: computer-xxx"
   - "API: Connection successful, project ID: computer-xxx"

## Manual Reset

To reset your project ID:
1. Clear browser local storage
2. Refresh the page
3. Connect again to create a new project

## Expected Behavior

- **First time**: Creates new project, saves ID
- **Subsequent connections**: Uses saved ID
- **If project deleted**: Creates new project, updates saved ID
- **If quota exceeded**: Shows error, keeps old ID for retry 