import MainLayout from './components/layout/MainLayout';
import AppRoutes from './routes/AppRoutes';
function App() {
  return (
    <div className="App">
      {/* Decorative background elements */}
      <div className="airplane-bg-element planeify-1">✈️</div>
      <div className="airplane-bg-element planeify-2">✈️</div>
      <div className="airplane-bg-element planeify-3">✈️</div>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </div>
  );
}

export default App;

