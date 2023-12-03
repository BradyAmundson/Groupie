import { db } from "./firebase";
import {
  collection,
  query,
  getDoc,
  addDoc,
  setDoc,
  orderBy,
  limit,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { randomizeGroups } from "../components/GroupRandomizer.js";

export async function createClassroom(roomId) {
  console.log(roomId);
  await setDoc(doc(db, "classrooms", roomId), { members: [] })
    .then(() => {
      return { roomId };
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
      return null;
    });
}

export async function getDocument(collectionName, documentId) {
  const documentRef = doc(db, collectionName, documentId);
  const documentSnapshot = await getDoc(documentRef);
  if (documentSnapshot.exists()) {
    return { id: documentSnapshot.id, ...documentSnapshot.data() };
  } else {
    return null;
  }
}

export async function joinClassroom(roomId, userId) {
  const documentRef = doc(db, "classrooms", roomId);
  const documentSnapshot = await getDoc(documentRef);
  const usrDocumentRef = doc(db, "users", userId);
  const usrDocumentSnapshot = await getDoc(usrDocumentRef);
  if (documentSnapshot.exists() && usrDocumentSnapshot.exists()) {
    const members = documentSnapshot.data().members;
    const currentCodes = usrDocumentSnapshot.data().classroomCodes || [];
    if (currentCodes.includes(roomId)) {
      return null;
    }
    const updatedCodes = [...currentCodes, roomId];
    members.push(userId);
    await updateDoc(documentRef, { members: members });
    await updateDoc(usrDocumentRef, {
      classroomCodes: updatedCodes,
    });
  } else {
    return null;
  }
}

export async function getGroups(roomId, setGroups, memberNames, groupSize) {
  const documentRef = doc(db, "classrooms", roomId);
  const documentSnapshot = await getDoc(documentRef);
  if (documentSnapshot.exists()) {
    const classroom = documentSnapshot.data();
    const members = classroom.members;
    const randomGroups = randomizeGroups(members, groupSize);
    await updateDoc(documentRef, { groups: randomGroups });
    setGroups(randomGroups);
  } else {
    return null;
  }
}

export async function saveGroups(roomId, groups, className) {
  const documentRef = doc(db, "classrooms", roomId);
  console.log(className);
  await updateDoc(documentRef, { groups: groups, className: className });
}

export async function createUser(firstName, lastName, userId, userType) {
  await setDoc(doc(db, "users", userId), {
    firstName: firstName,
    lastName: lastName,
    userType: userType,
    classroomCodes: [],
  })
    .then(() => {
      return { id: userId, data: { firstName, lastName, userType } };
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
      return null;
    });
}

export async function getUser(userId) {
  const documentRef = doc(db, "users", userId);
  const documentSnapshot = await getDoc(documentRef);
  if (documentSnapshot.exists()) {
    return { id: documentSnapshot.id, ...documentSnapshot.data() };
  } else {
    return null;
  }
}

export async function updateUser(userId, data) {
  await updateDoc(doc(db, "users", userId), data);
}
