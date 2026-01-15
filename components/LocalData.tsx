// Add confirmation from other devices in gym.

// Imports.
import LclLocations from "../assets/localData/locations.json";
import LclSettings from "../assets/localData/settings.json";
import LclStudents from "../assets/localData/students.json";
import LclTeachers from "../assets/localData/teachers.json";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Load local data.
type Locations = typeof LclLocations;
type Students = typeof LclStudents;
type Teachers = typeof LclTeachers;
export type Settings = typeof LclSettings;
export type Location = typeof LclLocations[0];
export type Student = typeof LclStudents[0];
export type Teacher = typeof LclTeachers[0];
const LOC_KEY = 'LCL_LOC';
const STU_KEY = 'LCL_STU';
const TEA_KEY = 'LCL_TEA';
const STN_KEY = 'LCL_SET';

// Clear all local data (for development/testing)
export async function clearAllData() {
  await AsyncStorage.multiRemove([LOC_KEY, STU_KEY, TEA_KEY, STN_KEY]);
}
export async function reinitializeAllData() {
  await AsyncStorage.multiRemove([LOC_KEY, STU_KEY, TEA_KEY, STN_KEY]);
}

export async function initializeLocData() {
  const existLoc = await AsyncStorage.getItem(LOC_KEY);
  if (!existLoc) { await AsyncStorage.setItem(LOC_KEY, JSON.stringify(LclLocations)); }
}
export async function initializeStuData() {
  const existStu = await AsyncStorage.getItem(STU_KEY);
  if (!existStu) { await AsyncStorage.setItem(STU_KEY, JSON.stringify(LclStudents)); }
}
export async function initializeTeaData() {
  const existTea = await AsyncStorage.getItem(TEA_KEY);
  if (!existTea) { await AsyncStorage.setItem(TEA_KEY, JSON.stringify(LclTeachers)); }
}
export async function initializeStnData() {
  const existStn = await AsyncStorage.getItem(STN_KEY);
  if (!existStn) { await AsyncStorage.setItem(STN_KEY, JSON.stringify(LclSettings)); }
}

// Read local data.
export async function readLocData(): Promise<Locations> {
  const jsonLoc = await AsyncStorage.getItem(LOC_KEY);
  if (!jsonLoc) throw new Error('Local location data not initialized');
  return JSON.parse(jsonLoc);
}
export async function readStuData(): Promise<Students> {
  const jsonStu = await AsyncStorage.getItem(STU_KEY);
  if (!jsonStu) throw new Error('Local student data not initialized');
  return JSON.parse(jsonStu);
}
export async function readTeaData(): Promise<Teachers> {
  const jsonTea = await AsyncStorage.getItem(TEA_KEY);
  if (!jsonTea) throw new Error('Local teacher data not initialized');
  return JSON.parse(jsonTea);
}
export async function readStnData(): Promise<Settings> {
  const jsonStn = await AsyncStorage.getItem(STN_KEY);
  if (!jsonStn) throw new Error('Local settings data not initialized');
  return JSON.parse(jsonStn);
}

// Mutate and save local data.
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
export async function updateStnData(updater: (settings: Settings) => Settings) {
  const stnData = await readStnData();
  const updatedJSON = updater(stnData);
  await AsyncStorage.setItem(STN_KEY, JSON.stringify(updatedJSON));
}

// Student data updaters.
export async function updateStuLocation(stuID: string, newLocID: string) {
  await updateStuData(students => {
    const student = students.find(s => s.id === stuID);
    if (!student) { throw new Error(`Student ${stuID} not found`); }
    student.currentLocID = newLocID;
    student.awaitingConfirmation = true;
    return students;
  });
}
export async function updateStuConfirmArrival(stuID: string) {
  await updateStuData(students => {
    const student = students.find(s => s.id === stuID);
    if (!student) { throw new Error(`Student ${stuID} not found`); }
    student.awaitingConfirmation = false;
    return students;
  });
}
export async function updateStuRejectArrival(stuID: string) {
  await updateStuData(students => {
    const student = students.find(s => s.id === stuID);
    if (!student) { throw new Error(`Student ${stuID} not found`); }
    student.currentLocID = student.previousLocID;
    student.awaitingConfirmation = false;
    return students;
  });
}

// Teacher data updaters.
export async function updateTeaLocation(teaID: string, newLocID: string) {
  await updateTeaData(teachers => {
    const teacher = teachers.find(t => t.id === teaID);
    if (!teacher) { throw new Error(`Teacher ${teaID} not found`); }
    teacher.currentLocID = newLocID;
    return teachers;
  });
}

// Location array getters.
export async function getLocArray(): Promise<Location[]> {
  const locData = await readLocData();
  const locList: Location[] = locData.slice(0);
  return locList;
}

// Student array getters.
export async function getStuArray(): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.slice(0);
  return stuList;
}
export async function getStuArrayByLocID(locID: string): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.filter(stu => stu.currentLocID === locID && !stu.awaitingConfirmation);
  return stuList;
}
export async function getStuArrayByLocIDAwaiting(locID: string): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.filter(stu => stu.currentLocID === locID && stu.awaitingConfirmation);
  return stuList;
}
export async function getStuArrayPresent(): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.filter(stu => stu.currentLocID !== "none");
  return stuList;
}
export async function getStuArrayNotPresent(): Promise<Student[]> {
  const stuData = await readStuData();
  const stuList: Student[] = stuData.filter(stu => stu.currentLocID === "none");
  return stuList;
}

// Teacher array getters.
export async function getTeaArray(): Promise<Teacher[]> {
  const teaData = await readTeaData();
  const teaList: Teacher[] = teaData.slice(0);
  return teaList;
}
export async function getTeaArrayByLocID(locID: string): Promise<Teacher[]> {
  const teaData = await readTeaData();
  const teaList: Teacher[] = teaData.filter(tea => tea.currentLocID === locID);
  return teaList;
}
export async function getTeaArrayPresent(): Promise<Teacher[]> {
  const teaData = await readTeaData();
  const teaList: Teacher[] = teaData.filter(tea => tea.currentLocID !== "none");
  return teaList;
}
export async function getTeaArrayNotPresent(): Promise<Teacher[]> {
  const teaData = await readTeaData();
  const teaList: Teacher[] = teaData.filter(tea => tea.currentLocID === "none");
  return teaList;
}