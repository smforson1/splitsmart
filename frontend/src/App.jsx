import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import GroupDetailPage from './pages/GroupDetailPage';
import AddExpensePage from './pages/AddExpensePage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/groups/:id/add-expense" element={<AddExpensePage />} />
          <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
