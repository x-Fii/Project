import { ServiceReportSignOff } from './components/ServiceReportSignOff.tsx';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#f8fafc', textAlign: 'center', marginBottom: '32px', fontFamily: 'sans-serif' }}>
          🏗️ Click-iX Enterprise ERP Systems
        </h1>
        <ServiceReportSignOff />
      </div>
    </div>
  );
}

export default App;