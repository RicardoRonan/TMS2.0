# MetaStack - Interactive Learning Platform

A modern, interactive tutorial platform built with Vue 3, TypeScript, and Supabase.

## Features

- 📚 **Interactive Tutorials** - Content pages with embedded exercises
- ❓ **Q&A Exercises** - Multiple choice, text input, and coding questions
- 🎯 **Mini Projects** - Hands-on coding projects
- 🏆 **Capstone Projects** - Comprehensive end-of-course projects
- 💻 **Code Editor** - Monaco Editor integration with syntax highlighting
- 📊 **Progress Tracking** - Automatic progress tracking for users
- 🔐 **Authentication** - User authentication with password reset
- 🎨 **Admin Panel** - Content management interface

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Code Editor**: Monaco Editor
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env`):
   ```bash
   cp .env.example .env
   ```
4. Configure your Supabase credentials in `.env`
5. Run the database schema:
   - Execute `database-schema.sql` in your Supabase SQL editor
6. Start the development server:
   ```bash
   npm run dev
   ```

## Tutorial System

### Page Types

1. **Content** (`page_type: 'content'`) - Regular tutorial pages with instructional content
2. **Q&A Exercise** (`page_type: 'qa'`) - Interactive question-and-answer pages
3. **Mini Project** (`page_type: 'mini_project'`) - Hands-on coding projects
4. **Capstone** (`page_type: 'capstone'`) - Comprehensive end-of-course projects

### Adding Q&A Pages

1. Go to **Admin Panel** → **Tutorials**
2. Click **"+ New Page"**
3. Fill in:
   - **Category**: Select your tutorial category
   - **Title**: `Q&A: [Topic Name]`
   - **Slug**: `qa-topic-name`
   - **Page Type**: Select **"Q&A Exercise"**
   - **Order**: Set the order number
   - **Published**: Check if ready
4. Click **"Create"**
5. Click the **"Q&A"** button next to the page to add questions

### Q&A Question Format

Questions can be added via the Admin panel or directly in markdown format in the page content:

```
INSTRUCTIONS:

Your question text here

OPTIONS:

[
  {"value": "A", "label": "Option A"},
  {"value": "B", "label": "Option B"},
  {"value": "C", "label": "Option C"},
  {"value": "D", "label": "Option D"}
]

CORRECT_ANSWER: C

POINTS: 5

HINTS:

Your hints here
```

The system automatically parses this format and creates interactive questions. Metadata sections (TEST_CASES, OPTIONS, CORRECT_ANSWER, etc.) are automatically hidden from users.

## Password Reset Setup

### Supabase Configuration

1. Go to **Authentication** → **Email Templates**
2. Configure the **"Reset Password"** template
3. Set **Site URL** in **Authentication** → **URL Configuration**
4. Add redirect URLs:
   - `http://localhost:5173/reset-password` (development)
   - `https://yourdomain.com/reset-password` (production)

The password reset functionality is already implemented in the codebase. You just need to configure the email templates and redirect URLs in Supabase.

## Project Structure

```
src/
├── components/
│   ├── CodeEditor.vue              # Monaco Editor component
│   └── tutorial/
│       ├── Exercise.vue            # Exercise component
│       ├── QAExercise.vue          # Q&A exercise component
│       └── ProjectExercise.vue     # Project exercise component
├── utils/
│   ├── exerciseRunner.ts           # Code execution and validation
│   ├── exerciseProgress.ts         # Progress tracking
│   └── markdown.ts                 # Markdown rendering and parsing
├── views/
│   ├── TutorialPage.vue            # Tutorial page view
│   ├── Tutorials.vue               # Tutorials listing
│   └── Admin.vue                   # Admin panel
└── database-schema.sql             # Database schema
```

## Database Schema

The database schema includes:

- `tutorial_pages` - Tutorial pages with page types
- `tutorial_exercises` - Coding exercises
- `tutorial_qa_questions` - Q&A questions
- `tutorial_exercise_submissions` - User submissions
- `tutorial_progress` - User progress tracking

Run `database-schema.sql` in your Supabase SQL editor to set up all tables, RLS policies, and triggers.

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Features in Detail

### Code Editor
- Monaco Editor integration
- Syntax highlighting for multiple languages
- Run and submit functionality
- Test case validation
- Error handling and display

### Progress Tracking
- Automatic progress updates
- Per-page completion tracking
- Exercise completion tracking
- User progress dashboard

### Markdown Support
- Full markdown rendering
- Code syntax highlighting
- Automatic metadata filtering
- Q&A question parsing from markdown

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code is clean (no console.logs, trailing whitespace, etc.)
4. Submit a pull request

## License

[Your License Here]
