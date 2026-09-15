/* ==========================================================================
   VERITAS — mock "centralized registry" data.
   In a production system this would live behind an authenticated API on a
   university/ministry-run server. Here it is seeded into localStorage on
   first run so the whole demo works purely client-side, offline, from
   Live Server, with no backend required.
   ========================================================================== */

const VERITAS_INSTITUTIONS = [
  { code: "NIT-DEL", name: "National Institute of Technology, Delhi", accredited: true, since: 1998, country: "India" },
  { code: "AUL-LON", name: "Auberon University, London", accredited: true, since: 1965, country: "United Kingdom" },
  { code: "PAC-TECH", name: "Pacific Institute of Technology", accredited: true, since: 2004, country: "United States" },
  { code: "STM-COL", name: "St. Meridian College of Commerce", accredited: true, since: 1979, country: "India" },
  { code: "NRV-UNI", name: "Norvenna University", accredited: true, since: 1954, country: "Germany" },
  { code: "KLS-INST", name: "Kolside Institute of Design", accredited: false, since: 2016, country: "India" }
];

// certificateId is what's encoded in the QR / printed on the certificate.
// integrityHash simulates a tamper-evident fingerprint issued by the registry
// at the time of graduation (in production: signed by the institution's key).
const VERITAS_REGISTRY = [
  {
    certificateId: "VRT-2021-NITD-88213",
    studentName: "Ananya Sharma",
    dob: "2000-03-14",
    degreeName: "Bachelor of Technology, Computer Science",
    institutionCode: "NIT-DEL",
    year: 2021,
    grade: "8.7 CGPA",
    status: "verified",
    integrityHash: "3f9a1c7e0b6d4285f7a1e9c0d2b6841aa7c5f3e19d0b6247e1a9c3d5b7f08e21"
  },
  {
    certificateId: "VRT-2019-AULL-40092",
    studentName: "James Whitcombe",
    dob: "1997-11-02",
    degreeName: "Master of Business Administration",
    institutionCode: "AUL-LON",
    year: 2019,
    grade: "Distinction",
    status: "verified",
    integrityHash: "8b2e6d1a4f7c9032e5b8a1d4f6c0937b2e5a8d1c4f7b0936e2a5d8c1f4b7093e"
  },
  {
    certificateId: "VRT-2022-PACT-51004",
    studentName: "Wei Lin",
    dob: "2001-06-21",
    degreeName: "Bachelor of Science, Data Engineering",
    institutionCode: "PAC-TECH",
    year: 2022,
    grade: "3.9 GPA",
    status: "verified",
    integrityHash: "c1d4a7e0b3f6903c6f9b2e5d8a1c4f7b0e3d6a9c2f5b8e1d4a7c0f3b6e9d2a5c"
  },
  {
    certificateId: "VRT-2018-STMC-30871",
    studentName: "Rahul Verma",
    dob: "1996-01-09",
    degreeName: "Bachelor of Commerce, Accounting & Finance",
    institutionCode: "STM-COL",
    year: 2018,
    grade: "First Class",
    status: "verified",
    integrityHash: "5e8b1a4d7c0f3690b3e6a9d2c5f8b1e4a7d0c3f6b9e2d5a8c1f4b7e0a3d6c9f2"
  },
  {
    certificateId: "VRT-2020-NRVU-19240",
    studentName: "Lena Fischer",
    dob: "1998-09-30",
    degreeName: "Master of Science, Mechanical Engineering",
    institutionCode: "NRV-UNI",
    year: 2020,
    grade: "1.4 (sehr gut)",
    status: "verified",
    integrityHash: "9d2f5b8e1a4c7d0f3b6e9c2a5d8f1b4e7a0d3c6f9b2e5a8d1c4f7b0e3a6d9c2f"
  },
  {
    certificateId: "VRT-2023-NITD-90112",
    studentName: "Priya Nair",
    dob: "2002-04-18",
    degreeName: "Bachelor of Technology, Electronics",
    institutionCode: "NIT-DEL",
    year: 2023,
    grade: "7.9 CGPA",
    status: "pending",
    integrityHash: "1a4d7c0f3b6e9d2a5c8f1b4e7a0d3c6f9b2e5a8d1c4f7b0e3a6d9c2f5b8e1a4d"
  },
  {
    // deliberately "flagged" record: hash on the presented certificate will not
    // match the registry hash, simulating an altered / forged document.
    certificateId: "VRT-2017-KLSI-77300",
    studentName: "Devansh Kapoor",
    dob: "1995-12-05",
    degreeName: "Diploma in Graphic Design",
    institutionCode: "KLS-INST",
    year: 2017,
    grade: "B+",
    status: "flagged",
    integrityHash: "0000000000000000000000000000000000000000000000000000000000000"
  }
];

function veritasInstitution(code){
  return VERITAS_INSTITUTIONS.find(i => i.code === code);
}

function veritasSeedOnce(){
  if(!localStorage.getItem("veritas_registry_seeded")){
    localStorage.setItem("veritas_registry_seeded", "1");
  }
}
veritasSeedOnce();
