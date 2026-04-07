# E-commerce Frontend

Modern React frontend for the e-commerce microservices platform.

## Features

- React 18 with hooks
- React Router for navigation
- Zustand for state management
- React Query for data fetching
- Stripe integration for payments
- Tailwind CSS for styling
- Form validation with Yup
- Toast notifications

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form + Yup
- **Payment**: Stripe React
- **Icons**: Lucide React

## Development

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Building

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:8080
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
```
