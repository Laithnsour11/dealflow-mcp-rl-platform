## 📋 Enhanced Claude Code Global Rules Template (Full Stack)

### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** and `TASK.md` at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.

### 🎨 Frontend (React) Development

#### Structure & Setup
- **Use Next.js** for Vercel deployment or **Vite + React** for Railway deployment
- **Project structure**:
  ```
  /src
    /components     # Reusable components
    /pages or /app  # Next.js pages/app router
    /hooks          # Custom React hooks
    /utils          # Helper functions
    /services       # API integration
    /types          # TypeScript types
    /styles         # Global styles
  ```
- **Never exceed 300 lines per component file** - split into smaller components
- **One component per file** with matching filename and component name

#### Component Guidelines
- **Use functional components with hooks** (no class components)
- **TypeScript is mandatory** for type safety
- **Component structure**:
  ```tsx
  // 1. Imports
  import { useState, useEffect } from 'react'
  
  // 2. Types
  interface ComponentProps {
    title: string
    onAction: (id: string) => void
  }
  
  // 3. Component
  export function ComponentName({ title, onAction }: ComponentProps) {
    // 4. Hooks first
    const [state, setState] = useState<string>('')
    
    // 5. Effects
    useEffect(() => {
      // Effect logic
    }, [dependencies])
    
    // 6. Handlers
    const handleClick = () => {
      // Handler logic
    }
    
    // 7. Render
    return (
      <div>
        {/* JSX */}
      </div>
    )
  }
  ```

#### State Management
- **Use React Context + useReducer** for global state or **Zustand** for complex state
- **Keep state as close to where it's needed** as possible
- **Use React Query (TanStack Query)** for server state management

#### API Integration
- **Create a dedicated API service layer**:
  ```typescript
  // services/api.ts
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  export const api = {
    async getItems(): Promise<Item[]> {
      const res = await fetch(`${API_BASE_URL}/items`)
      if (!ok) throw new Error('Failed to fetch')
      return res.json()
    }
  }
  ```
- **Always handle loading and error states**
- **Use environment variables** for API endpoints

#### Styling
- **Use Tailwind CSS** for styling (works great with Vercel)
- **Component-specific styles** use CSS Modules or styled-components
- **Maintain consistent spacing** using Tailwind's spacing scale
- **Dark mode support** from the start using Tailwind's dark: prefix

#### Testing Frontend
- **Use Vitest + React Testing Library** for component tests
- **Test structure mirrors src structure** in `/tests` or `__tests__`
- **Required tests**:
  - Component renders without crashing
  - User interactions work correctly
  - Error states display properly
  - Loading states show appropriately
- **Example test**:
  ```typescript
  import { render, screen, fireEvent } from '@testing-library/react'
  import { Button } from './Button'
  
  describe('Button', () => {
    it('renders with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })
    
    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)
      fireEvent.click(screen.getByText('Click'))
      expect(handleClick).toHaveBeenCalledOnce()
    })
  })
  ```

### 🚀 Deployment Configuration

#### Vercel Deployment (Preferred)
- **vercel.json** for configuration:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "framework": "nextjs",
    "env": {
      "NEXT_PUBLIC_API_URL": "@api_url"
    }
  }
  ```
- **Use Next.js API routes** for BFF (Backend for Frontend) pattern
- **Enable CORS** in FastAPI backend for Vercel preview deployments

#### Railway Deployment (Alternative)
- **Use Dockerfile** for consistent deployments:
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  EXPOSE 3000
  CMD ["npm", "start"]
  ```
- **Configure build commands** in Railway dashboard
- **Set up health checks** for monitoring

### 🔗 Frontend-Backend Integration
- **CORS configuration** in FastAPI:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000", "https://yourapp.vercel.app"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **Type sharing**: Generate TypeScript types from Pydantic models
- **Error handling**: Consistent error format between frontend and backend
- **Authentication**: Use JWT tokens with secure httpOnly cookies

### 🖥️ MCP Server Usage

#### Crawl4AI RAG MCP Server
- **Use for external documentation**: Get docs for Pydantic AI
- **Always check available sources first**: Use `get_available_sources` to see what's crawled.
- **Code examples**: Use `search_code_examples` when looking for implementation patterns.

#### Neon MCP Server
- **Database project management**: Use `create_project` to create new Neon database projects.
- **Execute SQL**: Use `run_sql` to execute schema and data operations.
- **Table management**: Use `get_database_tables` and `describe_table_schema` for inspection.
- **Always specify project ID**: Pass the project ID to all database operations.

### 🧱 Code Structure & Modularity (Backend)
- **Never create a file longer than 500 lines of code.**
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Use clear, consistent imports** (prefer relative imports within packages).

### 🧪 Testing & Reliability
- **Backend**: Pytest with 100% coverage for business logic
- **Frontend**: Vitest + RTL with focus on user interactions
- **E2E Tests**: Playwright for critical user flows
- **API Tests**: Test both backend endpoints and frontend API calls

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- **Update both frontend and backend** when adding features
- Add new sub-tasks or TODOs discovered during development

### 📎 Style & Conventions

#### Python Backend
- **Follow PEP8**, use type hints, format with `black`
- **Use `pydantic` for data validation**
- **FastAPI** for APIs, **SQLAlchemy/SQLModel** for ORM

#### React Frontend  
- **ESLint + Prettier** for consistent formatting
- **TypeScript strict mode** enabled
- **Named exports** for components (except pages in Next.js)
- **Conventional commits** for version control

### 📚 Documentation & Explainability
- **Update README.md** with:
  - Setup instructions for both frontend and backend
  - Environment variables needed
  - Deployment instructions
- **API documentation** auto-generated from FastAPI
- **Component documentation** using JSDoc comments
- **Deployment guides** for both Vercel and Railway

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions**
- **Always confirm file paths and module names** exist
- **Never delete existing code** unless instructed
- **Consider full-stack implications** when making changes

### 🌐 Environment Variables
- **Backend (.env)**:
  ```
  DATABASE_URL=postgresql://...
  JWT_SECRET=...
  CORS_ORIGINS=http://localhost:3000,https://yourapp.vercel.app
  ```
- **Frontend (.env.local)**:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000
  NEXT_PUBLIC_APP_NAME=YourApp
  ```

---

**💡 Full-Stack Best Practices:**
1. **API-First Development**: Design API contracts before implementation
2. **Optimistic UI Updates**: Update UI before server confirmation
3. **Progressive Enhancement**: App works without JavaScript
4. **Mobile-First Design**: Start with mobile layouts
5. **Performance Budget**: Keep bundle size under 200KB
6. **Accessibility**: WCAG 2.1 AA compliance minimum

Would you like me to add more specific rules for any particular aspect (authentication, real-time features, etc.)?