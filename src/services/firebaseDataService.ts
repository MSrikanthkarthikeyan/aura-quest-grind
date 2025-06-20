
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

export const firebaseDataService = {
  // Save user's game data
  async saveGameData(uid: string, gameData: Partial<FirebaseGameData>) {
    const userDocRef = doc(db, 'gameData', uid);
    await setDoc(userDocRef, {
      ...gameData,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  },

  // Load user's game data
  async loadGameData(uid: string): Promise<FirebaseGameData | null> {
    const userDocRef = doc(db, 'gameData', uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as FirebaseGameData;
    }
    return null;
  },

  // Save user profile from AI onboarding
  async saveUserProfile(uid: string, profile: UserProfile) {
    const userDocRef = doc(db, 'userProfiles', uid);
    await setDoc(userDocRef, {
      ...profile,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    });
  },

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'userProfiles', uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  // Listen to real-time updates
  subscribeToGameData(uid: string, callback: (data: FirebaseGameData | null) => void) {
    const userDocRef = doc(db, 'gameData', uid);
    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as FirebaseGameData);
      } else {
        callback(null);
      }
    });
  },

  // Save daily activity
  async saveDailyActivity(uid: string, activity: any) {
    const userDocRef = doc(db, 'gameData', uid);
    await updateDoc(userDocRef, {
      dailyActivities: arrayUnion(activity),
      lastUpdated: serverTimestamp()
    });
  },

  // Get streak data for calendar
  async getStreakData(uid: string, startDate: string, endDate: string) {
    const activitiesRef = collection(db, 'dailyActivities');
    const q = query(
      activitiesRef,
      where('uid', '==', uid),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  },

  // Save quest session
  async saveQuestSession(uid: string, questSession: any) {
    const sessionRef = doc(collection(db, 'questSessions'));
    await setDoc(sessionRef, {
      uid,
      ...questSession,
      timestamp: serverTimestamp()
    });
  }
};
