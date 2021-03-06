
import mongoose from 'mongoose';
 
import Poll from './poll';

console.log("connecting to database on " + process.env.DATABASE_URL)
 
const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, {useUnifiedTopology: true, useNewUrlParser: true});
};
 
const models = { Poll };
 
export { connectDb };
 
export default models;
