import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { RecordPage } from './pages/RecordPage';
import { TargetPage } from './pages/TargetPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<RecordPage />} />
          <Route path="target" element={<TargetPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
