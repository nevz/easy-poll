import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema(
  {
    id: String,
    question: {
      type: String,
      required: true,
    },
    alternatives: [String],
    votes: {
        type: Map,
        of: Number
    }
  },
  { timestamps: true },
);
 
const Poll = mongoose.model('Poll', pollSchema); 
console.log(Poll);

  
export default Poll;
