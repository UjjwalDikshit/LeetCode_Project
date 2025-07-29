import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,

// app starts , broswer rout is loaded. it listens to browesers url bar like / , /about
// initial url check:
// Suppose user opens http://localhost:3000/about —
// BrowserRouter sees the path /about, looks into <Routes>, finds: and And renders <About />.

// // now user click a link to /contact — or <Link to="/">Home</Link>
// React Router updates the URL to / — but does NOT reload the page.

// Instead, <BrowserRouter> tells <Routes>:
// “URL changed to /. Render the component for that path.”

// So now it renders <Home />.


)

//
//  | Item              | Role                                                  |
// | ----------------- | ----------------------------------------------------- |
// | `<BrowserRouter>` | A manager watching your address bar                   | updated url box by react router on every click on link
// | `<Link>`          | A button that changes the URL without reload          |
// | `<Routes>`        | A switchboard that decides what to show based on URL  |
// | `<Route>`         | Each rule: “If URL is `/about`, show About component” |

// https://chatgpt.com/s/t_6888b581fa5081919a49a3e620d06b98
