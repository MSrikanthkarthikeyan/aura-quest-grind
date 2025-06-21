
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  arrayUnion, 
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from './firebaseConfig';

interface FirebaseGameData {
  character: any;
  habits: any[];
  achievements: any[];
  userRoles: any;
  userProfile?: any;
  dailyActivities: any[];
  lastUpdated: any;
}

interface UserProfile {
  interests: string[];
  goals: string;
  routine: string;
  questStyle: string;
  timeCommitment: string;
  fitnessPreferences?: string[];
  skillLevel: string;
}

interface OnboardingProfile {
  name?: string;
  interests: string[];
  goal: string;
  dailyCommitment: string;
  preferredStyle: string;
  skillLevel?: string;
}

// Connection state management
let isConnected = true;
let retryAttempts = 0;
const maxRetryAttempts = 3;

const handleFirebaseError = (error: any, operation: string) => {
  console.error(`Firebase ${operation} error:`, error);
  
  // Check for network errors
  if (error.code === 'unavailable' || error.code === 'network-request-failed') {
    isConnected = false;
    console.warn('Firebase connection lost, operations will be retried');
  }
  
  // Log specific error details
  if (error.code) {
    console.error(`Error code: ${error.code}`);
  }
  if (error.message) {
    console.error(`Error message: ${error.message}`);
  }
};

const retryOperation = async (operation: () => Promise<any>, operationName: string) => {
  for (let attempt = 1; attempt <= maxRetryAttempts; attempt++) {
    try {
      const result = await operation();
      if (attempt > 1) {
        console.log(`${operationName} succeeded on attempt ${attempt}`);
      }
      retryAttempts = 0; // Reset on success
      isConnected = true;
      return result;
    } catch (error) {
      console.error(`${operationName} attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetryAttempts) {
        handleFirebaseError(error, operationName);
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Retrying ${operationName} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const firebaseDataService = {
  // Save user's game data with retry logic
  async saveGameData(uid: string, gameData: Partial<FirebaseGameData>) {
    return retryOperation(async () => {
      console.log(`Saving game data for user ${uid}:`, gameData);
      const userDocRef = doc(db, 'gameData', uid);
      await setDoc(userDocRef, {
        ...gameData,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      console.log('Game data saved successfully');
    }, 'saveGameData');
  },

  // Load user's game data with retry logic
  async loadGameData(uid: string): Promise<FirebaseGameData | null> {
    return retryOperation(async () => {
      console.log(`Loading game data for user ${uid}`);
      const userDocRef = doc(db, 'gameData', uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        console.log('Game data loaded successfully');
        return docSnap.data() as FirebaseGameData;
      }
      console.log('No game data found');
      return null;
    }, 'loadGameData');
  },

  // Save user profile from AI onboarding with retry logic
  async saveUserProfile(uid: string, profile: UserProfile) {
    return retryOperation(async () => {
      console.log(`Saving user profile for user ${uid}:`, profile);
      const userDocRef = doc(db, 'userProfiles', uid);
      await setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log('User profile saved successfully');
    }, 'saveUserProfile');
  },

  // Save onboarding profile to new structure with retry logic
  async saveOnboardingProfile(uid: string, profile: OnboardingProfile) {
    return retryOperation(async () => {
      console.log(`Saving onboarding profile for user ${uid}:`, profile);
      const userDocRef = doc(db, 'users', uid, 'profile', 'onboardingData');
      await setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log('Onboarding profile saved successfully');
    }, 'saveOnboardingProfile');
  },

  // Save generated quests with retry logic
  async saveGeneratedQuests(uid: string, quests: any[]) {
    return retryOperation(async () => {
      console.log(`Saving generated quests for user ${uid}:`, quests);
      const questsDocRef = doc(db, 'users', uid, 'quests', 'generated');
      await setDoc(questsDocRef, {
        quests,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log('Generated quests saved successfully');
    }, 'saveGeneratedQuests');
  },

  // Get user profile with retry logic
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    return retryOperation(async () => {
      console.log(`Getting user profile for user ${uid}`);
      const userDocRef = doc(db, 'userProfiles', uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        console.log('User profile retrieved successfully');
        return docSnap.data() as UserProfile;
      }
      console.log('No user profile found');
      return null;
    }, 'getUserProfile');
  },

  // Listen to real-time updates with improved error handling
  subscribeToGameData(uid: string, callback: (data: FirebaseGameData | null) => void) {
    try {
      console.log(`Setting up real-time subscription for user ${uid}`);
      const userDocRef = doc(db, 'gameData', uid);
      
      return onSnapshot(userDocRef, 
        (doc) => {
          console.log('Real-time update received');
          if (doc.exists()) {
            callback(doc.data() as FirebaseGameData);
          } else {
            console.log('No data in real-time update');
            callback(null);
          }
        }, 
        (error) => {
          console.error('Real-time subscription error:', error);
          handleFirebaseError(error, 'subscribeToGameData');
          // Don't throw, let the subscription continue with retries
        }
      );
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      handleFirebaseError(error, 'subscribeToGameData setup');
      throw error;
    }
  },

  // Save daily activity with retry logic
  async saveDailyActivity(uid: string, activity: any) {
    return retryOperation(async () => {
      console.log(`Saving daily activity for user ${uid}:`, activity);
      const userDocRef = doc(db, 'gameData', uid);
      await updateDoc(userDocRef, {
        dailyActivities: arrayUnion(activity),
        lastUpdated: serverTimestamp()
      });
      console.log('Daily activity saved successfully');
    }, 'saveDailyActivity');
  },

  // Get streak data for calendar with retry logic
  async getStreakData(uid: string, startDate: string, endDate: string) {
    return retryOperation(async () => {
      console.log(`Getting streak data for user ${uid} from ${startDate} to ${endDate}`);
      const activitiesRef = collection(db, 'dailyActivities');
      const q = query(
        activitiesRef,
        where('uid', '==', uid),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const streakData = querySnapshot.docs.map(doc => doc.data());
      console.log('Streak data retrieved successfully:', streakData);
      return streakData;
    }, 'getStreakData');
  },

  // Save quest session with retry logic
  async saveQuestSession(uid: string, questSession: any) {
    return retryOperation(async () => {
      console.log(`Saving quest session for user ${uid}:`, questSession);
      const sessionRef = doc(collection(db, 'questSessions'));
      await setDoc(sessionRef, {
        uid,
        ...questSession,
        timestamp: serverTimestamp()
      });
      console.log('Quest session saved successfully');
    }, 'saveQuestSession');
  },

  // Get connection status
  getConnectionStatus() {
    return { isConnected, retryAttempts };
  }
};
