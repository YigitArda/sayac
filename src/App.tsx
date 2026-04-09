import { Toaster } from '@/components/ui/sonner';
import { MainLayout } from '@/components/layout/MainLayout';

// Contexts
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { GoalsProvider } from '@/context/GoalsContext';
import { TodoProvider } from '@/context/TodoContext';
import { WellnessProvider } from '@/context/WellnessContext';
import { SocialProvider } from '@/context/SocialContext';
import { SmartFeaturesProvider } from '@/context/SmartFeaturesContext';
import { TimeBlockingProvider } from '@/context/TimeBlockingContext';
import { NotesProvider } from '@/context/NotesContext';
import { CoupleProvider } from '@/context/CoupleContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <GoalsProvider>
            <TodoProvider>
              <WellnessProvider>
                <SocialProvider>
                  <SmartFeaturesProvider>
                    <TimeBlockingProvider>
                      <NotesProvider>
                        <CoupleProvider>
                          <MainLayout />
                          <Toaster position="top-center" />
                        </CoupleProvider>
                      </NotesProvider>
                    </TimeBlockingProvider>
                  </SmartFeaturesProvider>
                </SocialProvider>
              </WellnessProvider>
            </TodoProvider>
          </GoalsProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
