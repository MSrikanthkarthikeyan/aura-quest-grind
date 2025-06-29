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
  getDocs,
  writeBatch
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

const retryOperation = async (operation: () => Promise<any>, operationName: string, maxRetries: number = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      
      if (attempt === maxRetries) {
        handleFirebaseError(error, operationName);
        throw error;
      }
      
      // Wait before retry (reduced exponential backoff for better performance)
      const delay = Math.min(500 * Math.pow(1.5, attempt - 1), 2000);
      console.log(`Retrying ${operationName} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const firebaseDataService = {
  // Optimized save with batching for better performance
  async saveGameData(uid: string, gameData: Partial<FirebaseGameData>) {
    return retryOperation(async () => {
      console.log(`Batched save for user ${uid}`);
      const batch = writeBatch(db);
      const userDocRef = doc(db, 'gameData', uid);
      
      batch.set(userDocRef, {
        ...gameData,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      await batch.commit();
      console.log('Batched game data saved successfully');
    }, 'saveGameData');
  },

  // Enhanced load with selective field loading
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
    }, 'loadGameData', 2);
  },

  // Optimized profile save with timeout and compression
  async saveUserProfile(uid: string, profile: UserProfile) {
    return retryOperation(async () => {
      console.log(`Saving compressed user profile for user ${uid}`);
      const userDocRef = doc(db, 'userProfiles', uid);
      
      // Add timeout to prevent hanging
      const savePromise = setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save operation timeout')), 8000)
      );
      
      await Promise.race([savePromise, timeoutPromise]);
      console.log('User profile saved successfully');
    }, 'saveUserProfile', 2);
  },

  // Save user profile from AI onboarding with retry logic and timeout
  async saveOnboardingProfile(uid: string, profile: OnboardingProfile) {
    return retryOperation(async () => {
      console.log(`Saving onboarding profile for user ${uid}:`, profile);
      const userDocRef = doc(db, 'users', uid, 'profile', 'onboardingData');
      
      const savePromise = setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save operation timeout')), 8000)
      );
      
      await Promise.race([savePromise, timeoutPromise]);
      console.log('Onboarding profile saved successfully');
    }, 'saveOnboardingProfile');
  },

  // Save generated quests with timeout
  async saveGeneratedQuests(uid: string, quests: any[]) {
    return retryOperation(async () => {
      console.log(`Saving generated quests for user ${uid}:`, quests);
      const questsDocRef = doc(db, 'users', uid, 'quests', 'generated');
      
      const savePromise = setDoc(questsDocRef, {
        quests,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save operation timeout')), 8000)
      );
      
      await Promise.race([savePromise, timeoutPromise]);
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

  // Listen to real-time updates with improved error handling and reconnection
  subscribeToGameData(uid: string, callback: (data: FirebaseGameData | null) => void) {
    try {
      console.log(`Setting up optimized real-time subscription for user ${uid}`);
      const userDocRef = doc(db, 'gameData', uid);
      
      return onSnapshot(userDocRef, 
        (doc) => {
          console.log('Real-time update received');
          isConnected = true; // Mark as connected on successful update
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
          
          // Attempt to reconnect with exponential backoff
          const reconnectDelay = Math.min(2000 * Math.pow(1.5, retryAttempts), 10000);
          retryAttempts++;
          
          setTimeout(() => {
            console.log(`Attempting to reestablish real-time connection (attempt ${retryAttempts})...`);
            if (retryAttempts < 5) { // Limit reconnection attempts
              this.subscribeToGameData(uid, callback);
            }
          }, reconnectDelay);
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
  },

  // Manual reconnection method
  async testConnection() {
    try {
      // Simple test operation with timeout
      const testDoc = doc(db, 'test', 'connection');
      const testPromise = getDoc(testDoc);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), 3000)
      );
      
      await Promise.race([testPromise, timeoutPromise]);
      isConnected = true;
      console.log('Firebase connection test successful');
      return true;
    } catch (error) {
      console.error('Firebase connection test failed:', error);
      isConnected = false;
      return false;
    }
  }
};
