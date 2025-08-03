# Orgo API Troubleshooting Guide

## Common Issues and Solutions

### 1. API Quota Exceeded Error
**Error:** `Free plan: 4GB total. Currently using 4GB. Delete an existing computer or upgrade to Pro.`

**Solution:**
- The free plan has a 4GB limit for active computers
- Delete existing computers from your Orgo dashboard
- Or upgrade to the Pro plan for higher limits
- The app will automatically try to create a new project when quota is exceeded

### 2. Project Not Found Error
**Error:** `Project not found` or `404 - Project not found`

**Solution:**
- This happens when trying to connect to a saved project that no longer exists
- The app will automatically create a new project instead
- No action required - just retry your request

### 3. Connection Issues
**Error:** Network or connection-related errors

**Solution:**
- Check your internet connection
- Verify your Orgo API key is correctly set in `.env.local`
- Try refreshing the page and reconnecting

## Environment Setup

Make sure you have the following in your `.env.local` file:

```env
ORGO_API_KEY=your_orgo_api_key_here
```

## API Key Setup

1. Get your API key from [Orgo.ai](https://orgo.ai)
2. Add it to your `.env.local` file
3. Restart the development server

## Development vs Production

- **Development**: Uses mock service for testing without API calls
- **Production**: Uses real Orgo API with proper error handling

## Error Handling Features

The app now includes:
- Automatic retry for connection issues
- Graceful handling of quota limits
- User-friendly error messages
- Automatic fallback to new projects when needed

## Getting Help

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Verify your API key is valid
3. Check your Orgo dashboard for active computers
4. Contact Orgo support for API-related issues 