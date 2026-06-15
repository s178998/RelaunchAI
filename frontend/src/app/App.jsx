// App.jsx - already good, no changes needed
import AppRoutes from "./routes";
import { AuthProvider } from "./providers";

function App() {
  return( 
    <div>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  )
}

export default App;