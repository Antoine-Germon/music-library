import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import {
  createBrowserRouter,
  RouterProvider,
  Link,
  Navigate
} from 'react-router-dom';

import DownloadSong from './components/DownloadSong/DownloadSong';
import SongPage, {loader as songPageLoader} from './components/SongPage/SongPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'downloadSong',
        element: <DownloadSong />
      },
      {
        path: 'listen',
        loader: songPageLoader,
        element: <SongPage />,
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
