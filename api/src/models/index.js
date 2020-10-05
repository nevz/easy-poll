
import mongoose from 'mongoose';
 
import Poll from './poll';
 
const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, {useUnifiedTopology: true, useNewUrlParser: true});
};
 
const models = { Poll };
 
export { connectDb };
 
export default models;
