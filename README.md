# ORCHA - AI Agent Orchestration Platform

A real-time AI agent orchestration platform with dynamic card creation and WebSocket-based communication. This platform allows AI agents to autonomously create, update, and manage tasks through a modern dark-themed UI.

## 🚀 Features

- **Dynamic Card Creation**: AI agents can create new task cards in real-time
- **Real-time Updates**: WebSocket-based communication for instant UI updates
- **Agent Management**: Monitor and manage multiple AI agents
- **Task Orchestration**: Automatic task assignment and execution
- **Demo Mode**: Simulated AI execution for demonstration purposes
- **Dark Theme UI**: Modern, sleek interface matching the design specifications
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
- **Express Server**: RESTful API endpoints
- **Socket.IO**: Real-time WebSocket communication
- **AI Orchestrator**: Manages AI agents and task execution
- **Card Manager**: Handles card state and operations

### Frontend (React + TypeScript)
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.IO Client**: Real-time communication
- **Lucide Icons**: Beautiful, consistent icons

## 📋 Prerequisites

- Node.js 18+ and npm 8+
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-agent-orchestrator
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   # AI Service API Keys
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # External Application APIs
   SLACK_BOT_TOKEN=your_slack_bot_token_here
   GITHUB_TOKEN=your_github_token_here
   
   # Demo Mode
   DEMO_MODE=true
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

This starts both the backend server (port 3001) and frontend development server (port 3000).

### Production Mode
```bash
npm run build
npm start
```

## 🎮 Usage

### Demo Mode
1. Open http://localhost:3000
2. Click "Start Demo" in the demo banner
3. Watch as AI agents create and process tasks automatically

### Creating Tasks
1. Use the input area at the bottom to send instructions
2. AI agents will automatically create cards and assign tasks
3. Monitor progress in real-time through the card interface

### Managing Cards
- **View**: Cards display task name, description, status, and progress
- **Filter**: Use the filter panel to sort by status, type, or priority
- **Search**: Search cards by name, description, or tags
- **Update**: Click status indicators to manually update task status

## 🔧 API Endpoints

### Cards
- `GET /api/cards` - Get all cards
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `PATCH /api/cards/:id/progress` - Update card progress

### Agents
- `GET /api/agents` - Get all agents
- `POST /api/agents/:id/assign` - Assign task to agent
- `POST /api/agents/process-task` - Process external task

### Demo
- `POST /api/demo/start` - Start demo sequence

## 🔌 WebSocket Events

### Client → Server
- `create_card` - Create new card
- `update_card` - Update existing card
- `delete_card` - Delete card
- `start_demo` - Start demo sequence

### Server → Client
- `message` - General message with typed payload
- `initial_data` - Initial cards and agents data
- `card_created` - New card created
- `card_updated` - Card updated
- `agent_updated` - Agent status updated

## 🎨 UI Components

### Sidebar
- Navigation icons with tooltips
- Collapsible design
- System status indicator

### Cards
- Task type icons (Cloud, Share, Terminal, Upload, Database)
- Status indicators with color coding
- Progress bars for active tasks
- Priority indicators
- Agent assignment display

### Header
- Demo mode banner
- Quick statistics
- Connection status

### Input Area
- Auto mode toggle
- File upload support
- Voice recording (placeholder)
- Quick action suggestions

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `DEMO_MODE` | Enable demo mode | false |
| `DEMO_DELAY_MS` | Delay between demo steps | 2000 |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `SLACK_BOT_TOKEN` | Slack bot token | - |

### Customization

#### Adding New Card Types
1. Update `CardType` enum in `shared/types.ts`
2. Add icon mapping in `client/src/components/Card.tsx`
3. Update agent capabilities in `server/services/aiOrchestrator.ts`

#### Adding New Agent Types
1. Update `AgentType` enum in `shared/types.ts`
2. Initialize new agents in `aiOrchestrator.ts`
3. Update task assignment logic

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test
```

## 📦 Deployment

### Docker (Recommended)
```bash
docker build -t ai-orchestrator .
docker run -p 3001:3001 ai-orchestrator
```

### Manual Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

## 🔮 Roadmap

- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Advanced AI agent capabilities
- [ ] Integration with more external services
- [ ] Mobile app
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support
