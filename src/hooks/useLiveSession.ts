import { useState, useEffect } from 'react';
import { firestoreModule } from '../lib/firestoreModule';
import { db } from '../lib/firebaseClient';

export function useLiveSession(sessionId: string) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = firestoreModule.onSnapshot(firestoreModule.doc(db, 'liveSessions', sessionId), (doc) => {
      setSession({ id: doc.id, ...doc.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId]);

  return { session, loading };
}
