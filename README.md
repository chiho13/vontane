# Widget notebook

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Setting Up the Environment

To set up your environment for this project, follow these steps:

1. **Install Node.js**: Ensure you have Node.js installed on your machine. [Download Node.js](https://nodejs.org/)

2. **Clone the Repository**: Clone the project repository to your local machine.

   ```bash
   git clone [your-repository-link]
   cd [your-project-name]
   ```

3. **Install Dependencies**: Install the necessary project dependencies.

   ```bash
   npm install
   ```

4. **Set up Supabase**:

   - Sign up or log in to your [Supabase account](https://app.supabase.com/).
   - Create a new project.
   - In the project settings, find your project's API keys and database URL.

5. **Configure Environment Variables**:

   - Create a `.env` file in the project root.
   - Add environment variables for Supabase (and other services as needed). Example:

     ```env
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

6. **Set Up Prisma**:

   - Install the Prisma CLI if you haven't already:

     ```bash
     npm install @prisma/cli --save-dev
     ```

   - Initialize Prisma in your project:

     ```bash
     npx prisma init
     ```

   - Configure your `prisma/schema.prisma` file to point to your database.

7. **Run the Development Server**:

   - Start your development server:

     ```bash
     npm run dev
     ```

   - Visit `http://localhost:3000` in your browser to see the application.

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel]
(https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

- [] - custom trading chart component?
- [] - add date for journaling
