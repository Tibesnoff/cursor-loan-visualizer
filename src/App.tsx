import { useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import { store } from './store';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { MyLoans } from './pages/MyLoans';
import './App.css';

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Provider store={store}>
      <Router>
        <Layout className="app-layout">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

          <Layout className="main-layout">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/loans" element={<MyLoans />} />
            </Routes>
          </Layout>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;