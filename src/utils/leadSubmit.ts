import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { LeadFormInput } from '../types/migrant';

export interface LeadSubmitResult {
  id: string;
  telegramStatus: 'sent' | 'skipped' | 'error';
  emailStatus: 'sent' | 'skipped' | 'error';
}

export async function submitLeadOrApplication(
  input: LeadFormInput
): Promise<LeadSubmitResult> {
  const currentUser = auth.currentUser;
  const cleanPayload: Record<string, unknown> = {
    type: input.type,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (input.vacancyId) cleanPayload.vacancyId = input.vacancyId.trim();
  if (input.vacancyTitle) cleanPayload.vacancyTitle = input.vacancyTitle.trim();
  if (input.country) cleanPayload.country = input.country.trim();
  if (input.companyName) cleanPayload.companyName = input.companyName.trim();
  if (input.staffCount) cleanPayload.staffCount = input.staffCount.trim();
  if (input.comment) cleanPayload.comment = input.comment.trim();

  let docId = '';

  if (currentUser && currentUser.emailVerified) {
    const appPayload: Record<string, unknown> = {
      ...cleanPayload,
      userId: currentUser.uid,
    };
    if (input.email || currentUser.email) {
      appPayload.email = (input.email || currentUser.email || '').trim();
    }
    try {
      const ref = await addDoc(collection(db, 'applications'), appPayload);
      docId = ref.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'applications');
    }
  } else {
    try {
      const ref = await addDoc(collection(db, 'leads'), cleanPayload);
      docId = ref.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }
  }

  let telegramStatus: 'sent' | 'skipped' | 'error' = 'skipped';
  let emailStatus: 'sent' | 'skipped' | 'error' = 'skipped';

  try {
    const notifyRes = await fetch('/api/leads/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (notifyRes.ok) {
      const json = await notifyRes.json();
      telegramStatus = json.telegramStatus ?? 'skipped';
      emailStatus = json.emailStatus ?? 'skipped';
    }
  } catch {
    // Notification dispatch failure should not roll back persisted Firestore lead
  }

  return { id: docId, telegramStatus, emailStatus };
}
