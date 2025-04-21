import mongoose, { Schema, Document } from 'mongoose';

// Define the crypto item interface
interface ICryptoItem {
  name: string;
  amount: string;
  amountInUsdt: string;
  parPrice: string;
}

// Define the portfolio interface
export interface IPortfolio extends Document {
  createdAt: Date;
  total: string;
  crypto: ICryptoItem[];
}

// Create the schema
const PortfolioSchema: Schema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  total: {
    type: String,
    required: true
  },
  crypto: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    amountInUsdt: {
      type: String,
      required: true
    },
    parPrice: {
      type: String,
      required: true
    }
  }]
});

// Create and export the model
export default mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
