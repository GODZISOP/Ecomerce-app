export default function BackendHome() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🟢</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46', marginBottom: '10px' }}>
        Backend is running perfectly
      </h1>
      <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>
        MediMart API Server is online and accepting requests.
      </p>
    </div>
  );
}
