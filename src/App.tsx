import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './store';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { MyLoans } from './pages/MyLoans';
import { LoanVisualizerPage } from './pages/LoanVisualizerPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import './components/layout/AppLayout.css';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <GlobalErrorHandler />
        <Router>
          <div className="app-container">
            <ErrorBoundary>
              <Sidebar />
            </ErrorBoundary>
            <div className="main-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ErrorBoundary>
                      <LandingPage />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/loans"
                  element={
                    <ErrorBoundary>
                      <MyLoans />
                    </ErrorBoundary>
                  }
                />
                <Route
                  path="/loan/:loanId"
                  element={
                    <ErrorBoundary>
                      <LoanVisualizerPage />
                    </ErrorBoundary>
                  }
                />
              </Routes>
            </div>
          </div>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;