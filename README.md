# Crypto Portfolio Tracker

A Next.js application for tracking your cryptocurrency portfolio over time.

## Features

- Track multiple cryptocurrencies in your portfolio
- Visualize portfolio value over time with charts
- Dark mode support
- Responsive design for mobile and desktop
- MongoDB integration for data storage

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/crypto-portfolio.git
   cd crypto-portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your MongoDB connection string:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crypto-portfolio?retryWrites=true&w=majority
   ```

   You can copy the `.env.local.example` file and update it with your credentials.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Setting Up MongoDB

### Option 1: MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster
3. In the Security tab, create a database user with read/write permissions
4. In the Network Access tab, add your IP address or allow access from anywhere for development
5. In the Databases tab, click "Connect" on your cluster
6. Select "Connect your application" and copy the connection string
7. Replace `<username>`, `<password>`, and `<dbname>` in the connection string with your credentials and database name
8. Add the connection string to your `.env.local` file

### Option 2: Local MongoDB (Development)

1. Install [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. Add the following to your `.env.local` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/crypto-portfolio
   ```

## Migrating from JSONBin

If you were previously using JSONBin for data storage, you can migrate your data to MongoDB:

1. Navigate to the `/migrate` page in the application
2. Enter your JSONBin ID and API Key
3. Click "Migrate Data"
4. Your data will be imported into MongoDB

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - React components
- `/lib` - Utility functions and database services
- `/types` - TypeScript type definitions
- `/public` - Static assets

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Recharts](https://recharts.org/) - Charting library
- [TypeScript](https://www.typescriptlang.org/) - Type checking

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
