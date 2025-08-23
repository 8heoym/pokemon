import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemon-math-adventure';
    
    await mongoose.connect(mongoUri, {
      // MongoDB 연결 옵션들이 최신 버전에서는 기본값으로 설정됨
    });
    
    console.log('MongoDB 연결 성공');
    
    // 연결 이벤트 리스너
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB 연결 오류:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 연결 해제');
    });
    
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
};