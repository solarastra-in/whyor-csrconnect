import { useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { db } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

export function PaymentNotifications() {
  const { roleInfo, user } = useAuth();
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!user || !roleInfo) return;

    let q;
    
    // For NGO Admin: notify when a payment is marked as 'completed' and 'platformDisbursed' (if Via Platform) or direct.
    if (roleInfo.role === 'ngo_admin' && roleInfo.charity?.id) {
      q = query(collection(db, 'payments'), where('ngoId', '==', roleInfo.charity.id));
    }
    // For Company Admin: notify when status updates or platform disburses
    else if (roleInfo.role === 'company_admin' && roleInfo.company?.id) {
      q = query(collection(db, 'payments'), where('companyId', '==', roleInfo.company.id));
    } else {
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (initialLoad.current) {
        initialLoad.current = false;
        return; // Don't trigger on initial load
      }

      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        
        if (change.type === 'modified') {
          if (roleInfo.role === 'ngo_admin') {
            if (data.status === 'completed' && data.platformDisbursed) {
               toast.success(`New funds disbursed to your NGO from ${data.companyName || 'Platform'}!`);
            }
          } else if (roleInfo.role === 'company_admin') {
            if (data.status === 'completed' && data.platformDisbursed) {
               toast.info(`Platform has disbursed your payment of ₹${data.amount} to ${data.ngoName}.`);
            } else if (data.status === 'completed') {
               toast.success(`Payment to ${data.ngoName} marked as completed.`);
            }
          }
        }
        
        if (change.type === 'added') {
          if (roleInfo.role === 'ngo_admin') {
            if (data.status === 'completed' && data.routingMode === 'Direct to NGO') {
               toast.success(`New direct payment received from ${data.companyName}!`);
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, roleInfo]);

  return null;
}
