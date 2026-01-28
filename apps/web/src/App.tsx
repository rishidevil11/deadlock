import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { LobbyPage } from '@/pages/LobbyPage';
import { DeadLockPage } from '@/pages/DeadLockPage';
import { CrackTheCodePage } from '@/pages/CrackTheCodePage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="lobby/:gameId" element={<LobbyPage />} />
                    <Route path="deadlock/:matchId" element={<DeadLockPage />} />
                    <Route path="crack-the-code/:matchId" element={<CrackTheCodePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
