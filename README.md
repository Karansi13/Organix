# Organix - AI-Powered Task Management

A comprehensive Todo Application built with Next.js, featuring AI-powered task management, seamless calendar integration, visual canvas for notes, and cross-platform desktop support via Electron.

## ✨ Features

### 🧠 AI-Powered Intelligence
- **Natural Language Task Creation**: Convert "Finish project report by Friday at 5 PM" into structured tasks
- **Smart Task Suggestions**: AI analyzes patterns and suggests relevant tasks
- **Priority Prediction**: Automatic priority assignment based on task content
- **Daily/Weekly Summaries**: AI-generated productivity insights

### 📋 Task Management
- **Kanban Board**: Visual task organization with drag-and-drop
- **CRUD Operations**: Create, read, update, delete tasks
- **Multi-Status Workflow**: Backlog → In Progress → Completed
- **Tags & Labels**: Organize tasks with custom categories
- **Search & Filters**: Full-text search with advanced filtering

### 🎨 Visual Canvas
- **Built-in Drawing Canvas**: Sketch ideas, create mind maps
- **Task Attachments**: Link drawings to specific tasks
- **Export Capabilities**: Save drawings as PNG files
- **Collaborative Sketching**: Share visual notes with team members

### 📅 Calendar Integration
- **Google Calendar Sync**: Automatic event creation for deadlines
- **Smart Scheduling**: AI suggests optimal time slots
- **Deadline Management**: Visual due date tracking
- **Cross-Platform Sync**: Works across web and desktop

### 👥 Collaboration
- **Team Boards**: Share task boards with team members
- **Permission Controls**: Read/write access management
- **Real-time Updates**: Live synchronization across devices
- **Activity Tracking**: Monitor team progress

### 🔧 Technical Features
- **Cross-Platform**: Web app + Desktop app (Electron)
- **Offline Support**: Work without internet, sync when connected
- **Dark/Light Themes**: Customizable UI preferences
- **Responsive Design**: Mobile-friendly interface
- **Data Export/Import**: JSON/CSV support

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Framer Motion** for animations
- **Fabric.js** for canvas functionality

### Backend
- **Next.js API Routes**
- **MongoDB** with Mongoose ODM
- **Clerk** for authentication
- **OpenAI API** for AI features
- **Google Calendar API** for calendar integration

### Desktop
- **Electron** for cross-platform desktop app
- **Auto-updater** support
- **Native menus** and shortcuts

### State Management
- **Zustand** for global state
- **React Hook Form** for form handling
- **React Query** (optional) for server state

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Clerk account for authentication
- OpenAI API key (for AI features)
- Google Cloud Console project (for calendar integration)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/organix.git
cd organix
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Authentication (Clerk)
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Configure authentication methods (email, social logins)
4. Add your keys to `.env.local`

### 5. Set Up Database (MongoDB)
1. Create MongoDB Atlas account or use local MongoDB
2. Create database and get connection string
3. Add connection string to `.env.local`

### 6. Set Up AI Features (OpenAI)
1. Create account at [openai.com](https://openai.com)
2. Generate API key
3. Add API key to `.env.local`

### 7. Set Up Google Calendar Integration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add client ID and secret to `.env.local`

## 🖥️ Development

### Web Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Desktop Development
```bash
# Start web dev server + Electron
npm run electron-dev

# Build desktop app
npm run build-electron

# Create distributable
npm run dist
```

## 📱 Usage

### Getting Started
1. **Sign Up/Sign In**: Create account or sign in via Clerk
2. **Create First Task**: Use the "Add Task" button or try AI natural language input
3. **Organize with Kanban**: Drag tasks between Backlog, In Progress, and Completed
4. **Try AI Features**: Use natural language like "Schedule team meeting next Tuesday"
5. **Explore Canvas**: Create visual notes and attach them to tasks

### AI Natural Language Examples
- "Finish quarterly report by Friday with high priority"
- "Call client about project update tomorrow at 2 PM"
- "Review code changes - urgent"
- "Plan vacation for next month"

### Keyboard Shortcuts (Desktop)
- `Ctrl/Cmd + N`: New task
- `Ctrl/Cmd + S`: Save current work
- `Ctrl/Cmd + F`: Search tasks
- `F11`: Toggle fullscreen

## 🔧 Configuration

### Theme Customization
Modify `src/app/globals.css` to customize colors and styling.

### AI Model Configuration
Change AI model in `src/lib/ai.ts`:
```typescript
// Use GPT-4 for better accuracy (higher cost)
model: "gpt-4"

// Use GPT-3.5-turbo for faster responses (lower cost)
model: "gpt-3.5-turbo"
```

### Database Schema
Models are defined in `src/lib/models/`:
- `Todo.ts` - Task data structure
- `User.ts` - User preferences and settings
- `CanvasDrawing.ts` - Canvas artwork data
- `Board.ts` - Collaborative boards

## 🚀 Deployment

### Web App Deployment (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Desktop App Distribution
```bash
# Build for current platform
npm run dist

# Build for all platforms (requires additional setup)
npm run dist -- --mac --win --linux
```

### Docker Deployment
```dockerfile
# Dockerfile included for containerized deployment
docker build -t organix .
docker run -p 3000:3000 organix
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate test coverage
npm run test:coverage
```

## 📚 API Documentation

### Todo API Endpoints
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/[id]` - Update todo
- `DELETE /api/todos/[id]` - Delete todo

### AI API Endpoints
- `POST /api/ai` - Get AI suggestions and summaries

### Canvas API Endpoints
- `GET /api/canvas` - Get canvas drawings
- `POST /api/canvas` - Save canvas drawing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.organix.com](https://docs.organix.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/organix/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/organix/discussions)
- **Email**: support@organix.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Clerk](https://clerk.com/) for seamless authentication
- [OpenAI](https://openai.com/) for powerful AI capabilities
- [Electron](https://electronjs.org/) for cross-platform desktop apps
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## 🗺️ Roadmap

### Version 1.1
- [ ] Mobile app (React Native)
- [ ] Advanced calendar views
- [ ] Time tracking features
- [ ] Team analytics dashboard

### Version 1.2
- [ ] Slack/Discord integrations
- [ ] Advanced AI workflows
- [ ] Custom themes and branding
- [ ] API webhooks

### Version 2.0
- [ ] Plugin system
- [ ] Advanced collaboration features
- [ ] Enterprise SSO support
- [ ] Advanced reporting and analytics

---

