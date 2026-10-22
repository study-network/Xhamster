import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StudyLayout } from './components/StudyLayout';
import { HomePage } from './pages/HomePage';
import { StudyPage } from './pages/StudyPage';
import { BatchesPage } from './pages/BatchesPage';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { PiPage } from './pages/PiPage';
import { NextToppersPage } from './pages/NextToppersPage';
import { NextToppersCoursePage } from './pages/NextToppersCoursePage';
import { NextToppersPlayerPage } from './pages/NextToppersPlayerPage';
import { MissionJeetPage } from './pages/MissionJeetPage';
import { MissionJeetCoursePage } from './pages/MissionJeetCoursePage';
import { VibrantPage } from './pages/VibrantPage';
import { VibrantCoursePage } from './pages/VibrantCoursePage';
import { SwayPage } from './pages/SwayPage';
import { SwayCoursePage } from './pages/SwayCoursePage';
import { MyBatchesPage } from './pages/MyBatchesPage';
import { HistoryPage } from './pages/HistoryPage';
import { ContactPage } from './pages/ContactPage';
import { WatchPage } from './pages/WatchPage';
import { KeyGeneratePage } from './pages/KeyGeneratePage';
import { PracticeTestPage } from './pages/PracticeTestPage';
import { EmbedPlayerPage } from './pages/EmbedPlayerPage';

export const AppContent: React.FC = () => {
  const { currentPath, batchIdParam } = useApp();

  // Root Landing page
  if (currentPath === '/') {
    return (
      <div className="flex flex-col min-h-screen bg-[#080b18] text-white">
        <Navbar />
        <main className="flex-1">
          <HomePage />
        </main>
        <Footer />
      </div>
    );
  }

  // Embedded Player route (for clean iframe embedding)
  if (currentPath.startsWith('/player/embed') || currentPath.startsWith('/embed')) {
    return <EmbedPlayerPage />;
  }

  // Dedicated NextToppers Video Player
  if (currentPath.startsWith('/study/nexttoppers/player')) {
    return <NextToppersPlayerPage />;
  }

  // Dedicated Watch / Player page
  if (currentPath.startsWith('/watch')) {
    return <WatchPage />;
  }

  // Interactive Test / DPP Exam page
  if (currentPath.startsWith('/practice-v2')) {
    return <PracticeTestPage />;
  }

  // Key Generation verification page
  if (currentPath.startsWith('/key-generate')) {
    return (
      <div className="flex flex-col min-h-screen bg-[#080b18] text-white">
        <Navbar />
        <main className="flex-1">
          <KeyGeneratePage />
        </main>
        <Footer />
      </div>
    );
  }

  // Contact page
  if (currentPath.startsWith('/contact')) {
    return (
      <div className="flex flex-col min-h-screen bg-[#080b18] text-white">
        <Navbar />
        <main className="flex-1">
          <ContactPage />
        </main>
        <Footer />
      </div>
    );
  }

  // All /study/* routes & /history are rendered inside StudyLayout
  return (
    <StudyLayout>
      {batchIdParam ? (
        <BatchDetailPage />
      ) : currentPath === '/study' || currentPath === '/study/schedule' ? (
        <StudyPage />
      ) : currentPath.startsWith('/study/batches') ? (
        <BatchesPage />
      ) : currentPath.startsWith('/study/pi') ? (
        <PiPage />
      ) : currentPath.startsWith('/study/nexttoppers/') ? (
        <NextToppersCoursePage />
      ) : currentPath.startsWith('/study/nexttoppers') ? (
        <NextToppersPage />
      ) : currentPath.startsWith('/study/missionjeet/') ? (
        <MissionJeetCoursePage />
      ) : currentPath.startsWith('/study/missionjeet') ? (
        <MissionJeetPage />
      ) : currentPath.startsWith('/study/vibrant/') ? (
        <VibrantCoursePage />
      ) : currentPath.startsWith('/study/vibrant') ? (
        <VibrantPage />
      ) : currentPath.startsWith('/study/sway/') ? (
        <SwayCoursePage />
      ) : currentPath.startsWith('/study/sway') ? (
        <SwayPage />
      ) : currentPath.startsWith('/study/mybatches') ? (
        <MyBatchesPage />
      ) : currentPath.startsWith('/history') ? (
        <HistoryPage />
      ) : (
        <BatchesPage />
      )}
    </StudyLayout>
  );
};

export default AppContent;
