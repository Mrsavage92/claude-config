import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { useThemeEffect } from '@/hooks/useTheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { DashboardPage } from '@/pages/DashboardPage';
import { LearnPage } from '@/pages/LearnPage';
import { LearnDomainPage } from '@/pages/LearnDomainPage';
import { PracticePage } from '@/pages/PracticePage';
import { RapidFirePage } from '@/pages/RapidFirePage';
import { FlashFirePage } from '@/pages/FlashFirePage';
import { MockExamConfigPage } from '@/pages/MockExamConfigPage';
import { MockExamSessionPage } from '@/pages/MockExamSessionPage';
import { MockExamResultsPage } from '@/pages/MockExamResultsPage';
import { LabsPage } from '@/pages/LabsPage';
import { LabDetailPage } from '@/pages/LabDetailPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { SourcesPage } from '@/pages/SourcesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  useThemeEffect();
  return (
    <AppShell>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:domainId" element={<LearnDomainPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/rapid-fire" element={<RapidFirePage />} />
          <Route path="/flash-fire" element={<FlashFirePage />} />
          <Route path="/mock-exam" element={<MockExamConfigPage />} />
          <Route path="/mock-exam/session" element={<MockExamSessionPage />} />
          <Route path="/mock-exam/results" element={<MockExamResultsPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/labs/:labId" element={<LabDetailPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </ErrorBoundary>
    </AppShell>
  );
}
