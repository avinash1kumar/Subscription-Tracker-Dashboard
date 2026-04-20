const mongoose = require('mongoose')
require('dotenv').config()

const Expense = require('../src/models/Expense')

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI
    if (!mongoUri) throw new Error('MONGO_URI is missing from .env')

    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Fix name typos
    const sRes = await Expense.updateMany({ name: { $regex: /^sopping$/i } }, { $set: { name: 'Shopping' } })
    console.log(`Updated names from 'sopping' to 'Shopping': ${sRes.modifiedCount}`)

    const rRes = await Expense.updateMany({ name: { $regex: /^room rant$/i } }, { $set: { name: 'Room Rent' } })
    console.log(`Updated names from 'room rant' to 'Room Rent': ${rRes.modifiedCount}`)

    // Also maybe category?
    const scRes = await Expense.updateMany({ category: { $regex: /^sopping$/i } }, { $set: { category: 'Shopping' } })
    console.log(`Updated categories from 'sopping' to 'Shopping': ${scRes.modifiedCount}`)

    const rcRes = await Expense.updateMany({ category: { $regex: /^room rant$/i } }, { $set: { category: 'Room Rent' } })
    console.log(`Updated categories from 'room rant' to 'Room Rent': ${rcRes.modifiedCount}`)

    // Status migration
    // First, verify 'Paid' and 'Planned' are in enum, but let's just use raw bypass if needed. Actually we will update schema first.
    const payRes = await Expense.updateMany({ status: 'Done' }, { $set: { status: 'Paid' } })
    console.log(`Migrated 'Done' to 'Paid': ${payRes.modifiedCount}`)

    const planRes = await Expense.updateMany({ status: 'Upcoming' }, { $set: { status: 'Planned' } })
    console.log(`Migrated 'Upcoming' to 'Planned': ${planRes.modifiedCount}`)
    
    // Some might not have status at all? Set them to Paid by default
    const missRes = await Expense.updateMany({ status: { $exists: false } }, { $set: { status: 'Paid' } })
    console.log(`Set missing statuses to 'Paid': ${missRes.modifiedCount}`)

    console.log('Cleanup complete.')
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    mongoose.disconnect()
  }
}

run()
