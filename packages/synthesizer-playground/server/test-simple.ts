import axios from 'axios';

// 실제 이더리움 트랜잭션 해시 (테스트용)
const TEST_TX_ID = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

async function testServer() {
  console.log('🚀 Testing server at http://localhost:3002');
  console.log('==========================================\n');

  try {
    // 서버에 요청 보내기
    console.log(`📤 Sending request with txId: ${TEST_TX_ID}`);
    
    const response = await axios.post('http://localhost:3002/api/parseTransaction', {
      txId: TEST_TX_ID
    }, {
      timeout: 30000, // 30초 타임아웃
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Request successful!');
    console.log('📊 Response status:', response.status);
    
    const data = response.data;
    
    if (data.ok) {
      console.log('\n📋 Response Data Structure:');
      console.log('========================');
      
      // 전체 응답 구조 확인
      console.log('\n1. 전체 응답 구조:');
      console.log(JSON.stringify(data, null, 2));
      
      // 주요 데이터 필드들 확인
      if (data.data) {
        console.log('\n2. 주요 필드들:');
        console.log('- from:', data.data.from);
        console.log('- to:', data.data.to);
        console.log('- logs count:', data.data.logs?.length || 0);
        console.log('- storageLoad count:', data.data.storageLoad?.length || 0);
        console.log('- storageStore count:', data.data.storageStore?.length || 0);
        
        // permutation과 placementInstance 상세 확인
        console.log('\n3. Permutation 구조:');
        console.log(JSON.stringify(data.data.permutation, null, 2));
        
        console.log('\n4. PlacementInstance 구조:');
        console.log(JSON.stringify(data.data.placementInstance, null, 2));
        
        // logs 상세 확인
        if (data.data.logs && data.data.logs.length > 0) {
          console.log('\n5. Logs 상세:');
          data.data.logs.forEach((log: any, index: number) => {
            console.log(`Log ${index}:`, JSON.stringify(log, null, 2));
          });
        }
        
        // storage 데이터 상세 확인
        if (data.data.storageLoad && data.data.storageLoad.length > 0) {
          console.log('\n6. StorageLoad 상세 (첫 3개):');
          data.data.storageLoad.slice(0, 3).forEach((item: any, index: number) => {
            console.log(`StorageLoad ${index}:`, JSON.stringify(item, null, 2));
          });
        }
        
        if (data.data.storageStore && data.data.storageStore.length > 0) {
          console.log('\n7. StorageStore 상세 (첫 3개):');
          data.data.storageStore.slice(0, 3).forEach((item: any, index: number) => {
            console.log(`StorageStore ${index}:`, JSON.stringify(item, null, 2));
          });
        }
      }
      
    } else {
      console.log('❌ Request failed:', data.error);
    }
    
  } catch (error: any) {
    console.log('❌ Error occurred:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error data:', error.response.data);
    } else if (error.request) {
      console.log('No response received. Server might not be running.');
      console.log('Make sure to start the server with: npm run server');
    } else {
      console.log('Error:', error.message);
    }
  }
}

// 실행
testServer().catch(console.error); 