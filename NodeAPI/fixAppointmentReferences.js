const mongoose = require('mongoose');
const Appointment = require('./DataModel/Appointment');
const User = require('./DataModel/User');
const Hospital = require('./DataModel/Hospital');
const Vaccine = require('./DataModel/Vaccine');

async function fixAppointmentReferences() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1/vaccination', { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB');

    // Get all appointments that need fixing
    const appointments = await Appointment.find({
      $or: [
        { hospitalId: null },
        { vaccineId: null },
        { userId: null }
      ]
    });

    console.log(`Found ${appointments.length} appointments that need fixing`);

    // Get all users, hospitals, and vaccines
    const users = await User.find({});
    const hospitals = await Hospital.find({});
    const vaccines = await Vaccine.find({});

    console.log(`Found ${users.length} users, ${hospitals.length} hospitals, ${vaccines.length} vaccines`);

    // Create maps for easy lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user._id;
    });

    let fixedCount = 0;

    for (const appointment of appointments) {
      let updated = false;

      // Fix userId if missing and userName exists
      if (!appointment.userId && appointment.userName && userMap[appointment.userName]) {
        appointment.userId = userMap[appointment.userName];
        updated = true;
        console.log(`Fixed userId for appointment ${appointment._id}, userName: ${appointment.userName}`);
      }

      // Fix hospitalId if missing - assign a random hospital for demo purposes
      if (!appointment.hospitalId && hospitals.length > 0) {
        const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];
        appointment.hospitalId = randomHospital._id;
        updated = true;
        console.log(`Assigned hospital ${randomHospital.name} to appointment ${appointment._id}`);
      }

      // Fix vaccineId if missing - assign a random vaccine for demo purposes
      if (!appointment.vaccineId && vaccines.length > 0) {
        const randomVaccine = vaccines[Math.floor(Math.random() * vaccines.length)];
        appointment.vaccineId = randomVaccine._id;
        updated = true;
        console.log(`Assigned vaccine ${randomVaccine.name} to appointment ${appointment._id}`);
      }

      if (updated) {
        await appointment.save();
        fixedCount++;
      }
    }

    console.log(`Fixed ${fixedCount} appointments`);
    console.log('Data migration completed successfully!');

  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
fixAppointmentReferences();
