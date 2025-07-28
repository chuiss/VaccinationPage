const fs = require('fs');

function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const hexChars = '0123456789abcdef';
  const rest = Array.from({length: 16}, () => hexChars[Math.floor(Math.random() * 16)]).join('');
  return timestamp + rest;
}

function generateMockData() {
  const genders = ['Male', 'Female', 'Other'];
  const diseases = ['None', 'Diabetes', 'Asthma', 'Hypertension', 'Allergy'];
  const professions = ['Engineer', 'Teacher', 'Doctor', 'Student', 'Artist'];
  
  const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kara', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rose'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  const hospitalNames = ['City Hospital', 'General Clinic', 'Health Center', 'Medical Hub', 'Wellness Hospital'];
  const hospitalTypes = ['Public', 'Private'];
  const hospitals = [];
  for (let i = 0; i < 10; i++) {
    hospitals.push({
      _id: { $oid: generateObjectId() },
      name: `${hospitalNames[Math.floor(Math.random() * hospitalNames.length)]} ${i + 1}`,
      address: `Address ${i + 1}, City`,
      type: hospitalTypes[Math.floor(Math.random() * 2)],
      charges: Math.floor(Math.random() * 500) + 100,
      __v: 0
    });
  }
  
  const vaccineNames = ['Pfizer', 'Moderna', 'AstraZeneca', 'Sinovac', 'Johnson'];
  const vaccineTypes = ['mRNA', 'Viral Vector', 'Inactivated'];
  const vaccines = [];
  for (let i = 0; i < 10; i++) {
    vaccines.push({
      _id: { $oid: generateObjectId() },
      name: `${vaccineNames[Math.floor(Math.random() * vaccineNames.length)]} ${i + 1}`,
      type: vaccineTypes[Math.floor(Math.random() * 3)],
      price: Math.floor(Math.random() * 100) + 10,
      origin: ['USA', 'UK', 'China'][Math.floor(Math.random() * 3)],
      dosesRequired: Math.floor(Math.random() * 2) + 1,
      description: 'Vaccine description',
      __v: 0
    });
  }
  
  const users = [];
  const appointments = [];
  for (let i = 0; i < 500; i++) {
    const userOid = generateObjectId();
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const username = `user${i + 1}`;
    const password = '123';
    const age = Math.floor(Math.random() * 63) + 18;
    const gender = genders[Math.floor(Math.random() * 3)];
    const disease = diseases[Math.floor(Math.random() * 5)];
    const profession = professions[Math.floor(Math.random() * 5)];
    const contact = `555-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const address = `Street ${Math.floor(Math.random() * 100)}, City`;
    
    users.push({
      _id: { $oid: userOid },
      username, password, role: 'patient', name, age, profession, contact, address, gender, disease,
      __v: 0
    });
    
    const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
    const vaccine = vaccines[Math.floor(Math.random() * vaccines.length)];
    const dateObj = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const date = { $date: dateObj.toISOString() };
    const time = `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00`;
    const title = 'Vaccination Appointment';
    const location = hospital.address;
    const userId = userOid;
    const userName = name;
    const hospitalId = hospital._id.$oid;
    const vaccineId = vaccine._id.$oid;
    const status = ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
    
    appointments.push({
      _id: { $oid: generateObjectId() },
      date, time, title, location, userId, userName, hospitalId, vaccineId, status,
      __v: 0
    });
  }
  
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  fs.writeFileSync('vaccines.json', JSON.stringify(vaccines, null, 2));
  fs.writeFileSync('hospitals.json', JSON.stringify(hospitals, null, 2));
  fs.writeFileSync('appointments.json', JSON.stringify(appointments, null, 2));
  
  console.log('Mock data saved to JSON files');
}

generateMockData();