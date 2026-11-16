

import { db } from "/src/firebaseConfig.js";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

const followDocId = (followerId, followedId) => `${followerId}_${followedId}`;

export async function followUser(myUid, otherUid) {
  if (myUid === otherUid) return; // can't follow yourself of coures
  await setDoc(doc(db, "follows", followDocId(myUid, otherUid)), {
    followerId: myUid,
    followedId: otherUid,
    followedAt: serverTimestamp(),
  });
}

export async function unfollowUser(myUid, otherUid) {
  await deleteDoc(doc(db, "follows", followDocId(myUid, otherUid)));
}

// uids of everyone `uid` is following
export async function getFollowingIds(uid) {
  const snap = await getDocs(query(collection(db, "follows"), where("followerId", "==", uid)));
  return snap.docs.map((d) => d.data().followedId);
}

// uids of everyone who is following `uid`
export async function getFollowerIds(uid) {
  const snap = await getDocs(query(collection(db, "follows"), where("followedId", "==", uid)));
  return snap.docs.map((d) => d.data().followerId);
}
