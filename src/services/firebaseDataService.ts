
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

export const firebaseDataService = {
  // Save user's game data
  async saveGameData(uid: string, gameData: Partial<FirebaseGameData>) {
    try {
      console.log(`Saving game data for user ${uid}:`, gameData);
      const userDocRef = doc(db, 'gameData', uid);
      await setDoc(userDocRef, {
        ...gameData,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      console.log('Game data saved successfully');
    } catch (error) {
      console.error('Error saving game data:', error);
      throw error;
    }
  },

  // Load user's game data
  async loadGameData(uid: string): Promise<FirebaseGameData | null> {
    try {
      console.log(`Loading game data for user ${uid}`);
      const userDocRef = doc(db, 'gameData', uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        console.log('Game data loaded successfully');
        return docSnap.data() as FirebaseGameData;
      }
      console.log('No game data found');
      return null;
    } catch (error) {
      console.error('Error loading game data:', error);
      throw error;
    }
  },

  // Save user profile from AI onboarding
  async saveUserProfile(uid: string, profile: UserProfile) {
    try {
      console.log(`Saving user profile for user ${uid}:`, profile);
      const userDocRef = doc(db, 'userProfiles', uid);
      await setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log('User profile saved successfully');
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  // Save onboarding profile to new structure
  async saveOnboardingProfile(uid: string, profile: OnboardingProfile) {
    try {
      console.log(`Saving onboarding profile for user ${uid}:`, profile);
      const userDocRef = doc(db, 'users', uid, 'profile', 'onboardingData');
      await setDoc(userDocRef, {
        ...profile,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log('Onboarding profile saved successfully');
    } catch (error) {
      console.error('Error saving onboarding profile:', error);
      throw error;
    }
  },

  // Save generated quests
  async saveGeneratedQuests(uid: string, quests: any[]) {
    try {
      console.log(`Saving generated quests for user ${uid}:`, quests);
      const questsDocRef = doc(db, 'users', uid, 'quests', 'generated');
      await setDoc(questsDocRef, {
        quests,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      console.log('Generated quests saved successfully');
    } catch (error) {
      console.error('Error saving generated quests:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      console.log(`Getting user profile for user ${uid}`);
      const userDocRef = doc(db, 'userProfiles', uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        console.log('User profile retrieved successfully');
        return docSnap.data() as UserProfile;
      }
      console.log('No user profile found');
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Listen to real-time updates
  subscribeToGameData(uid: string, callback: (data: FirebaseGameData | null) => void) {
    try {
      console.log(`Setting up real-time subscription for user ${uid}`);
      const userDocRef = doc(db, 'gameData', uid);
      return onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          console.log('Real-time update received');
          callback(doc.data() as FirebaseGameData);
        } else {
          console.log('No data in real-time update');
          callback(null);
        }
      }, (error) => {
        console.error('Error in real-time subscription:', error);
      });
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      throw error;
    }
  },

  // Save daily activity
  async saveDailyActivity(uid: string, activity: any) {
    try {
      console.log(`Saving daily activity for user ${uid}:`, activity);
      const userDocRef = doc(db, 'gameData', uid);
      await updateDoc(userDocRef, {
        dailyActivities: arrayUnion(activity),
        lastUpdated: serverTimestamp()
      });
      console.log('Daily activity saved successfully');
    } catch (error) {
      console.error('Error saving daily activity:', error);
      throw error;
    }
  },

  // Get streak data for calendar
  async getStreakData(uid: string, startDate: string, endDate: string) {
    try {
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
    } catch (error) {
      console.error('Error getting streak data:', error);
      throw error;
    }
  },

  // Save quest session
  async saveQuestSession(uid: string, questSession: any) {
    try {
      console.log(`Saving quest session for user ${uid}:`, questSession);
      const sessionRef = doc(collection(db, 'questSessions'));
      await setDoc(sessionRef, {
        uid,
        ...questSession,
        timestamp: serverTimestamp()
      });
      console.log('Quest session saved successfully');
    } catch (error) {
      console.error('Error saving quest session:', error);
      throw error;
    }
  }
};
