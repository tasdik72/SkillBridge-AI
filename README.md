# SkillBridge AI

**Bridge your skills. Build your future. Shape your community.**

SkillBridge AI is an innovative EduTech platform designed to empower youth aged 15-29 with personalized career and learning pathways. By leveraging AI, we provide structured roadmaps, facilitate peer-to-peer mentorship, and offer micro-scholarships to incentivize learning and skill development.

## Key Features

- **AI-Generated Roadmaps**: Personalized learning paths for any skill or career goal.
- **Micro-Scholarships**: Earn rewards for completing milestones.
- **Peer-to-Peer Mentorship**: Connect with mentors to guide your learning journey.
- **Community Hub**: Collaborate, share, and learn with a vibrant community of peers.
- **AI Wellness Companion**: Simple AI-powered support to maintain a healthy learning-life balance.
- **Impact Dashboard**: Track your progress and showcase your achievements to potential employers.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **AI**: OpenRouter for Large Language Model (LLM) access

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/skillbridge-ai.git
    cd skillbridge-ai
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following environment variables. You can get these from your Supabase and OpenRouter dashboards.

    ```env
    VITE_SUPABASE_URL=your-supabase-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    VITE_OPENROUTER_API_KEY=your-openrouter-api-key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

## Project Structure

```
src
├── assets
├── components
├── contexts
├── layouts
├── pages
├── services
└── types
```

- **`components`**: Reusable UI components (e.g., `Sidebar`, `Header`).
- **`contexts`**: React contexts for state management (e.g., `AuthContext`, `DatabaseContext`, `AIContext`).
- **`layouts`**: Main layout components for the application.
- **`pages`**: Application pages (e.g., `Dashboard`, `Profile`, `Roadmap`).
- **`services`**: Services for interacting with external APIs (e.g., `supabase.ts`, `ai.ts`).

## Database Schema

Our database is built on PostgreSQL and managed through Supabase. The key tables include:

- `profiles`: Stores user data and roles.
- `roadmaps`: Stores AI-generated learning roadmaps.
- `community_posts`: Powers the community feed.
- `mentorship_requests`: Manages mentor-mentee connections.

For detailed schema information, please refer to `schema.sql`.

## Contributing

We welcome contributions! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.
