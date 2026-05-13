const mongoose = require('mongoose');
const dns = require('dns');

const configureDns = () => {
  const servers = process.env.DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers?.length) {
    dns.setServers(servers);
  }
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from the environment');
    }

    configureDns();
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 10000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connection error:', err.message);
    if (err.message.includes('querySrv')) {
      console.error(
        'MongoDB Atlas SRV DNS lookup failed. Try a different network, disable VPN/proxy, or use a local MongoDB URI.'
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;
