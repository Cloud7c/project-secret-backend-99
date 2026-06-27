import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './assets/css/style.css'
import './assets/css/hero.css'
import './assets/css/listings.css'
import './assets/css/footer.css'
import './assets/css/product.css'
import './assets/css/login.css'
import './assets/css/register.css'
import './assets/css/account.css'
import './assets/css/admin.css'
import './assets/css/machinery.css'
import './assets/css/vehicles.css'
import './assets/css/spares.css'
import './assets/css/post-ad.css'
import './assets/css/services.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
