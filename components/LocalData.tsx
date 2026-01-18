// Imports.
import AsyncStorage from "@react-native-async-storage/async-storage";
import DBLocations from "../assets/localData/locations.json";
import DBStudents from "../assets/localData/students.json";
import DBTeachers from "../assets/localData/teachers.json";
import DBGroups from "../assets/localData/groups.json";
import DBSettings from "../assets/localData/settings.json";

// Types and keys.
type Locations = typeof DBLocations;
type Students = typeof DBStudents;
type Teachers = typeof DBTeachers;
type Groups = typeof DBGroups;
export type Settings = typeof DBSettings;
export type Location = (typeof DBLocations)[0];
export type Student = (typeof DBStudents)[0];
export type Teacher = (typeof DBTeachers)[0];
export type Group = (typeof DBGroups)[0];
const LOC_KEY = "DB_LOC";
const STU_KEY = "DB_STU";
const TEA_KEY = "DB_TEA";
const GRU_KEY = "DB_GRU";
const STN_KEY = "DB_STN";

// Clear all local data (for development/testing).
export async function clearAllData() {
  await AsyncStorage.multiRemove([LOC_KEY, STU_KEY, TEA_KEY, GRU_KEY, STN_KEY]);
}
export async function reinitializeAllData() {
  await AsyncStorage.multiRemove([LOC_KEY, STU_KEY, TEA_KEY, GRU_KEY, STN_KEY]);
}

// Initialize data.
export async function initializeLocData() {
  const existLoc = await AsyncStorage.getItem(LOC_KEY);
  if (!existLoc) { await AsyncStorage.setItem(LOC_KEY, JSON.stringify(DBLocations)); }
}
export async function initializeStuData() {
  const existStu = await AsyncStorage.getItem(STU_KEY);
  if (!existStu) { await AsyncStorage.setItem(STU_KEY, JSON.stringify(DBStudents)); }
}
export async function initializeTeaData() {
  const existTea = await AsyncStorage.getItem(TEA_KEY);
  if (!existTea) { await AsyncStorage.setItem(TEA_KEY, JSON.stringify(DBTeachers)); }
}
export async function initializeGruData() {
  const existGru = await AsyncStorage.getItem(GRU_KEY);
  if (!existGru) { await AsyncStorage.setItem(GRU_KEY, JSON.stringify(DBGroups)); }
}
export async function initializeStnData() {
  const existStn = await AsyncStorage.getItem(STN_KEY);
  if (!existStn) { await AsyncStorage.setItem(STN_KEY, JSON.stringify(DBSettings)); }
}

// Read data.
export async function readLocData(): Promise<Locations> {
  const jsonLoc = await AsyncStorage.getItem(LOC_KEY);
  if (!jsonLoc) throw new Error("Local location data not initialized");
  return JSON.parse(jsonLoc);
}
export async function readStuData(): Promise<Students> {
  const jsonStu = await AsyncStorage.getItem(STU_KEY);
  if (!jsonStu) throw new Error("Local student data not initialized");
  return JSON.parse(jsonStu);
}
export async function readTeaData(): Promise<Teachers> {
  const jsonTea = await AsyncStorage.getItem(TEA_KEY);
  if (!jsonTea) throw new Error("Local teacher data not initialized");
  return JSON.parse(jsonTea);
}
export async function readGruData(): Promise<Groups> {
  let jsonGru = await AsyncStorage.getItem(GRU_KEY);
  if (!jsonGru) {
    // If not initialized, initialize it first
    await initializeGruData();
    jsonGru = await AsyncStorage.getItem(GRU_KEY);
  }
  if (!jsonGru) throw new Error("Local group data not initialized");
  return JSON.parse(jsonGru);
}
export async function readStnData(): Promise<Settings> {
  let jsonStn = await AsyncStorage.getItem(STN_KEY);
  if (!jsonStn) {
    // If not initialized, initialize it first
    await initializeStnData();
    jsonStn = await AsyncStorage.getItem(STN_KEY);
  }
  if (!jsonStn) throw new Error("Local settings data not initialized");
  return JSON.parse(jsonStn);
}

// Mutate and save data.
export async function updateLocData(updater: (locations: Locations) => Locations) {
  const locData = await readLocData();
  const updatedJSON = updater(locData);
  await AsyncStorage.setItem(LOC_KEY, JSON.stringify(updatedJSON));
}
export async function updateStuData(updater: (students: Students) => Students) {
  const stuData = await readStuData();
  const updatedJSON = updater(stuData);
  await AsyncStorage.setItem(STU_KEY, JSON.stringify(updatedJSON));
}
export async function updateTeaData(updater: (teachers: Teachers) => Teachers) {
  const teaData = await readTeaData();
  const updatedJSON = updater(teaData);
  await AsyncStorage.setItem(TEA_KEY, JSON.stringify(updatedJSON));
}
export async function updateGruData(updater: (groups: Groups) => Groups) {
  const gruData = await readGruData();
  const updatedJSON = updater(gruData);
  await AsyncStorage.setItem(GRU_KEY, JSON.stringify(updatedJSON));
}
export async function updateStnData(updater: (settings: Settings) => Settings) {
  const stnData = await readStnData();
  const updatedJSON = updater(stnData);
  await AsyncStorage.setItem(STN_KEY, JSON.stringify(updatedJSON));
}

// Student data updaters.
export async function updateStuAbsent(stuID: string) {
  await updateStuData((students) => {
    const student = students.find((s) => s.id === stuID);
    if (!student) { throw new Error(`Student ${stuID} not found`); }
    student.currentLocID = "none";
    student.previousLocID = "none";
    student.awaitingConfirmation = false;
    student.present = false;
    return students;
  });
}
export async function updateStuPresent(stuID: string) {
  const defaultLocID = (await readLocData()).find((l) => l.isDefault === true)?.id;
  await updateStuData((students) => {
    const student = students.find((s) => s.id === stuID);
    if (!student) { throw new Error(`Student ${stuID} not found`); }
    student.currentLocID = defaultLocID || "NO_DEFAULT_LOC_FOUND";
    student.present = true;
    return students;
  });
}
export async function updateStuLocation( stuID: string | string[], newLocID: string, ) {
  await updateStuData((students) => {
    const stuIDs = Array.isArray(stuID) ? stuID : [stuID];
    stuIDs.forEach((id) => {
      const student = students.find((s) => s.id === id);
      if (!student) { throw new Error(`Student ${id} not found`); }
      student.previousLocID = student.currentLocID;
      student.currentLocID = newLocID;
      student.awaitingConfirmation = true;
    });
    return students;
  });
}
export async function updateStuConfirmArrival(stuID: string) {
  await updateStuData((students) => {
    const student = students.find((s) => s.id === stuID);
    if (!student) { throw new Error(`Student ${stuID} not found`); }
    student.awaitingConfirmation = false;
    return students;
  });
}
export async function updateStuRejectArrival(stuID: string) {
  await updateStuData((students) => {
    const student = students.find((s) => s.id === stuID);
    if (!student) { throw new Error(`Student ${stuID} not found`); }
    student.currentLocID = student.previousLocID;
    student.awaitingConfirmation = false;
    return students;
  });
}
export async function updateStuProfile(stuID: string, updates: Partial<Student>) {
  await updateStuData((students) => {
    const student = students.find((s) => s.id === stuID);
    if (!student) { throw new Error(`Student ${stuID} not found`); }
    Object.assign(student, updates);
    return students;
  });
}

// Teacher data updaters.
export async function updateTeaAbsent(teaID: string) {
  await updateTeaData((teachers) => {
    const teacher = teachers.find((t) => t.id === teaID);
    if (!teacher) { throw new Error(`Teacher ${teaID} not found`); }
    teacher.currentLocID = "none";
    teacher.present = false;
    return teachers;
  });
}
export async function updateTeaPresent(teaID: string) {
  const defaultLocID = (await readLocData()).find((l) => l.isDefault === true)?.id;
  await updateTeaData((teachers) => {
    const teacher = teachers.find((t) => t.id === teaID);
    if (!teacher) { throw new Error(`Teacher ${teaID} not found`); }
    teacher.currentLocID = defaultLocID || "NO_DEFAULT_LOC_FOUND";
    teacher.present = true;
    return teachers;
  });
}
export async function updateTeaLocation(teaID: string, newLocID: string) {
  await updateTeaData((teachers) => {
    const teacher = teachers.find((t) => t.id === teaID);
    if (!teacher) { throw new Error(`Teacher ${teaID} not found`); }
    teacher.currentLocID = newLocID;
    return teachers;
  });
}
export async function updateTeaProfile(teaID: string, updates: Partial<Teacher>) {
  await updateTeaData((teachers) => {
    const teacher = teachers.find((t) => t.id === teaID);
    if (!teacher) { throw new Error(`Teacher ${teaID} not found`); }
    Object.assign(teacher, updates);
    return teachers;
  });
}

// Location getters.
export async function getLocArray(): Promise<Location[]> {
  const locData = await readLocData();
  const locList: Location[] = locData.slice(0);
  return locList;
}

// Student getters.
export async function getStuArray(): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.slice(0);
  return stuList;
}
export async function getStuArrayByLocID(locID: string): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.filter((s) => s.currentLocID === locID && !s.awaitingConfirmation);
  return stuList;
}
export async function getStuArrayByLocIDAwaiting(locID: string): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.filter((s) => s.currentLocID === locID && s.awaitingConfirmation);
  return stuList;
}
export async function getStuArrayPresent(): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.filter((s) => s.currentLocID !== "none");
  return stuList;
}
export async function getStuArrayNotPresent(): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.filter((s) => s.currentLocID === "none");
  return stuList;
}

// Teacher getters.
export async function getTeaArray(): Promise<Teacher[]> {
  const teaData = await readTeaData();
  const teaList: Teacher[] = teaData.slice(0);
  return teaList;
}
export async function getTeaArrayByLocID(locID: string): Promise<Teacher[]> {
  const teaData = await readTeaData();
  const teaList: Teacher[] = teaData.filter((t) => t.currentLocID === locID);
  return teaList;
}
export async function getTeaArrayPresent(): Promise<Teacher[]> {
  const teaData = await readTeaData();
  const teaList: Teacher[] = teaData.filter((t) => t.currentLocID !== "none");
  return teaList;
}
export async function getTeaArrayNotPresent(): Promise<Teacher[]> {
  const teaData = await readTeaData();
  const teaList: Teacher[] = teaData.filter((t) => t.currentLocID === "none");
  return teaList;
}

// Group getters.
export async function getGruArray(): Promise<Group[]> {
  const gruData = await readGruData();
  const gruList: Group[] = gruData.slice(0);
  return gruList;
}
export async function getGruName(gruID: string): Promise<string> {
  const group = (await readGruData()).find((g) => g.id === gruID);
  return group?.name || "UNKNOWN_GROUP_ID";
}
export async function getGruColor(gruID: string): Promise<string> {
  const group = (await readGruData()).find((g) => g.id === gruID);
  return group?.color || "UNKNOWN_GROUP_ID";
}

// Settings getters.
export async function getRoundUpRatios(): Promise<boolean> {
  const settings = await readStnData();
  return settings.roundUpRatios;
}
export async function getNotifyThresholdPassed(): Promise<boolean> {
  const settings = await readStnData();
  return settings.notifyThresholdPassed;
}
export async function getMaxThreshold(): Promise<number> {
  const settings = await readStnData();
  return settings.maxThreshold;
}
export async function getWarnThreshold(): Promise<number> {
  const settings = await readStnData();
  return settings.warnThreshold;
}
