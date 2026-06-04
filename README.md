# Generate Video MCP

MCP server for Agnes AI video generation.

## Features

- **Text-to-Video**: Generate videos from text prompts
- **Custom duration**: Configurable video length (1-20 seconds)
- **Custom resolution**: Configurable video resolution
- **Task status tracking**: Check the status of async video generation tasks
- **Metadata storage**: Automatic metadata storage for all generated videos
- **Multi-platform support**: Works with OpenCode, Claude Desktop, Cursor, Windsurf, and more

## Tools

### `generate_video`

Generate a video from a text prompt.

**Parameters:**
- `prompt` (string, required): Description of the video
- `duration` (number, optional): Video duration in seconds (1-20), default `5`
- `size` (string, optional): Video resolution in WxH format, default `1152x768`

### `check_video_status`

Check the status of a video generation task.

**Parameters:**
- `task_id` (string, required): The task ID returned by `generate_video`

## Quick Setup

```bash
npx --yes generate-video-mcp
```

## Installation

### From npm (Recommended)

```bash
npm install -g generate-video-mcp
```

### From GitHub

```bash
# Option 1: Direct install from GitHub
npm install -g github:m1908293028-boop/generate-video-mcp

# Option 2: Clone and install
git clone https://github.com/m1908293028-boop/generate-video-mcp.git
cd generate-video-mcp
npm install
npm run build
npm link

# Then use it
npx --yes generate-video-mcp
```

### Via npx (No Installation)

```bash
npx --yes generate-video-mcp
```

## Manual Installation

```bash
# Install globally
npm install -g generate-video-mcp
```

## Platform-Specific Configuration

### OpenCode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "generate-video": {
      "type": "local",
      "command": ["npx", "--yes", "generate-video-mcp"],
      "enabled": true,
      "environment": {
        "AGNES_API_KEY": "your-agnes-api-key",
        "AGNES_API_URL": "https://apihub.agnes-ai.com"
      },
      "timeout": 1200000
    }
  },
  "experimental": {
    "mcp_timeout": 1200000
  }
}
```

### Claude Desktop

Add to `~/.claude/mcp.json` (macOS/Linux) or `%USERPROFILE%\.claude\mcp.json` (Windows):

```json
{
  "mcpServers": {
    "generate-video": {
      "command": "npx",
      "args": ["--yes", "generate-video-mcp"],
      "env": {
        "AGNES_API_KEY": "your-agnes-api-key",
        "AGNES_API_URL": "https://apihub.agnes-ai.com"
      }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "generate-video": {
      "command": "npx",
      "args": ["--yes", "generate-video-mcp"],
      "env": {
        "AGNES_API_KEY": "your-agnes-api-key",
        "AGNES_API_URL": "https://apihub.agnes-ai.com"
      }
    }
  }
}
```

### Windsurf

Add to `~/.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "generate-video": {
      "command": "npx",
      "args": ["--yes", "generate-video-mcp"],
      "env": {
        "AGNES_API_KEY": "your-agnes-api-key",
        "AGNES_API_URL": "https://apihub.agnes-ai.com"
      }
    }
  }
}
```

### Cline (VS Code)

Add to `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` (Windows) or `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` (macOS):

```json
{
  "mcpServers": {
    "generate-video": {
      "command": "npx",
      "args": ["--yes", "generate-video-mcp"],
      "env": {
        "AGNES_API_KEY": "your-agnes-api-key",
        "AGNES_API_URL": "https://apihub.agnes-ai.com"
      }
    }
  }
}
```

## API Key

### Agnes AI

- Website: https://agnes-ai.com
- Get API Key: Register at https://agnes-ai.com
- Endpoint: `https://apihub.agnes-ai.com`

Set the `AGNES_API_KEY` environment variable with your API key.

## How It Works

1. **Text-to-Video**: Sends the prompt to Agnes API with specified parameters (duration, resolution)
2. **Task Polling**: The server polls the API until the video is completed or failed
3. **Video Retrieval**: Downloads the completed video and returns the URL

## Example Usage

### Generate Video

```
Create a cinematic drone shot of a sunset over a mountain range
```

### Check Status

```
Check the status of video task: <task_id>
```

## License

MIT
