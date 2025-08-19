// test_airdrop.js - Test script for the airdrop eligibility generator

const { AirdropEligibilityGenerator, computeStandaloneProofHash } = require('../script/submissions');

// Test data based on your examples
const testProofData = {
    "proof_entries_part1": [
        "0x0c24fdec12d53a11da4d980c17d4e1a1",
        "0x17a05805dfe64737462cc7905747825b",
        "0x0896a633d5adf4b47c13d51806d66a35",
        "0x0a083a0932bebfbe2075aaf972cc5af7",
        "0x0a28401cd04c6e2e0bf2677b09d43a4c",
        "0x182ee1ed2f42610a39b255b4a0e84ee5",
        "0x0bd00d0783c76029e7d10c85d8b7a054",
        "0x087cbceebc924fadbff19a7059e44a68",
        "0x0ab348bc443f0fae8b8cf657e1c970ce",
        "0x1445acc8d6f02dddd0e17eaafd98d200",
        "0x001708378a5785dc70d0e217112197b9",
        "0x0783caf01311feb7b0896a179ad220d2",
        "0x0c5479dab696569b5943662da9194b3b",
        "0x0cabc8d2b5e630fd8b5698e2d4ce9370",
        "0x11d4bbafa0da1fc302112e38300bd9a1",
        "0x0a3c0cc511d40fa513a97ab0fae9da99",
        "0x03dbeb7f79d515638ed23e5ce018f592",
        "0x0d1c6c26b1f7d69bb0441eb8fde52aa4",
        "0x04be84681792a0a5afabba29ed3fcfb8",
        "0x05fb88f7324750e43d173a23aee8181e",
        "0x170f46f976ef61677cbebcdefb74feeb",
        "0x0b17a6a12b6fb13eca79be94abc8582b",
        "0x064aac9536b7b2ce667f9ba6a28cb1d3",
        "0x15f89d14f23e7cd275787c22e59b7cfb",
        "0x1768019026542d286a58258435158b31",
        "0x0a61414b5c2ccfe907df78c2b39bcd2e",
        "0x04f4c3891678a4e32c90b78e11a6ade1",
        "0x1982759528c860a8757bc2afc9f7fda4",
        "0x158ca44f01aac0407705fe5cc4d44f5c",
        "0x0a03d544f26007212ab4d53d3a8fcb87",
        "0x086ece3d5d70f8815d8b1c3659ca8a8a",
        "0x10b90670319cd41cf4af3e0b474be4ca",
        "0x158ca44f01aac0407705fe5cc4d44f5c",
        "0x0a03d544f26007212ab4d53d3a8fcb87",
        "0x126cbc300279a36e774d9e1c1953e9dc",
        "0x0ee0a0e6d60e1f8527d56093560223f5",
        "0x18ab22994ea4cb2eb9ebea8af602f8dd",
        "0x129eab9c15fcd487d09de770171b6912"
    ],
    "proof_entries_part2": [
        "0x29afb6b437675cf15e0324fe3bad032c88bd9addc36ff22855acb73a5c3f4cef",
        "0xdd670e5cdb1a14f5842e418357b752ee2200d5eab40a3990615224f2467c985a",
        "0xa379b716417a5870cc2f334e28cd91a388c5e3f18012f24700a103ea0c2aacb2",
        "0xffaac16f6dc2f74a0e7e18fba4e5585b4e5d642ded1156a1f58f48853e59aa42",
        "0xa23bfdfdfca0f91636ecc5527ac26058e20d58bac954eb642bae8bd626ef7010",
        "0x6f9598e15cdb8c85c5ac7ac0a78e1385446815324b91f17efacada8c544d2196",
        "0xba1b4b3bc86fb24b15799faa6c863b93de799bcb6a7aa6b000dff5e3dab2471f",
        "0xec6e41cb9cf3cc5910993ea9f08f40bd100ddf83f93f04e6bdd316797ef0beb0",
        "0xe9df3c6debe8c19110bc1d660e4deb5a52301ac37ecc90879bd68ecc8d97bdd2",
        "0x00fc98c6635577ff28950f2143aa83508c93095237abd83d69e2b24886dea95a",
        "0x63914eaba1999e91128214fdc6658ecfbc495062ceef8457ca7a1ec6c0d0e0eb",
        "0xd5bbef14f885ccbe203d48b0014ffdb943845363b278c4ab5be13674a2378134",
        "0x3d07b6d0abc0874227371ff6317cac98105f2f6fc1181cd1d66a4e4ec946cc65",
        "0x3f31b28005195499d4af392ca85edb0cee55452f39d4237641476955548e12af",
        "0xa66c27ac6a19f296259e0979530c4fcd90cb9e74249871c0c6489485404d9063",
        "0xd72bca363ba9ae574db315d4336478d0042b3e0e61270a4792a28368185a3194",
        "0xed8921adcbf1cf3805b293511a1b11363907a3aac8f481d8fd94374c040e5d6b",
        "0xd434523ed473b876e8ec1d784d149db6f706deac4d472677587a1fce0a161b3b",
        "0x6ea759852f22461d6206b877123aa7b5e0c8c2f252bcfd67e7db9e270f4f89f0",
        "0x58673a8bd4ce54d417f3f4611f1a17babe9ae036c26dbd1c090b5aa21b103e7e",
        "0x795bb282127eb89f0f74f3ac4225110c7f6ba1d28ee3585c5d2f9fd87407a076",
        "0x1c5f55837e396d3133e3327a1d55181c43e70a40175eec9830f504196143addc",
        "0xd6f85a33ffc841e63ffb0f7397933fbc479255bc76350181f60e8a674ce4a511",
        "0x042e8d8894ad3c74b0a4e53b6d4ed6ef593d6c289192c995573db09388ff6d11",
        "0x1569d3423b1b51e0bc46ba0eb5cc6a5d85d824a38380712cc45cf82afaf207a5",
        "0x1ab0450608bd2e5ba51dc73326511bf150fc5641615ae710a50b693b243642c7",
        "0x08daa13bff0ada0a5bc43ed4d7cea70dd8f326ceb3b4e45c371dd2700ef6f0c6",
        "0x4b3655e123391a00b8d3071defdab3c8b8417c0f5a547d6b589dcd20ecd33e7e",
        "0xc6e1ae5fca24804ade878f6ef38651c10c05a135e3f97bfd2d904fda94c7a9b1",
        "0x7a4e463b9e70b0b696dfbdf889158587a97fef29a5ccec0e9280623518965f4d",
        "0xcc5b7968dccd9e745adadb83015cd9e23c93952cb531f2f4288da589c0069574",
        "0xe7f91b230e048be6e77b32dc40b244236168ca832273465751c4f2ccc01cbf64",
        "0xc6e1ae5fca24804ade878f6ef38651c10c05a135e3f97bfd2d904fda94c7a9b1",
        "0x7a4e463b9e70b0b696dfbdf889158587a97fef29a5ccec0e9280623518965f4d",
        "0xbaea13ee7c8871272649ac7715c915a9a56ed50a8dea0571e2eff309d40f58ab",
        "0x82225a228142d0995337f879f93baf9f33e98586d1fc033a7dacbef88a99fe20",
        "0x4f776b37f90ad57ce6ea738d9aa08ab70f7b59b4f3936d07b1232bb77dc23b49",
        "0x9186c52b1e29b407b2ced700d98969bd27ef020d51bedc925a12759bc01b277d",
        "0x5cbd85f2d305fe00912332e05075b9f0de9c10f44ec7ab91b1f62084281f248c",
        "0x72369709049708f987668022c05c3ff71329e24dbda58f5107687c2c1c019bc3",
        "0x54bf083810754a2f2e0ea1a9c2cc1cd0dff97d8fd62a463be309018d5e482d10",
        "0x4f95625e828ae72498ff9d6e15029b414cd6cc9a8ba6d8f1dc1366f2879c76a8"
    ]
};

const testPreprocessData = {
    "preprocess_entries_part1": [
        "0x0d8838cc826baa7ccd8cfe0692e8a13d",
        "0x103aeb959c53fdd5f13b70a350363881",
        "0x09f0f94fd2dc8976bfeab5da30e1fa04",
        "0x17cb62f5e698fe087b0f334e2fb2439c"
    ],
    "preprocess_entries_part2": [
        "0xbbae56c781b300594dac0753e75154a00b83cc4e6849ef3f07bb56610a02c828",
        "0xf3447285889202e7e24cd08a058a758a76ee4c8440131be202ad8bc0cc91ee70",
        "0x76e577ad778dc4476b10709945e71e289be5ca05c412ca04c133c485ae8bc757",
        "0x7ada41cb993109dc7c194693dbcc461f8512755054966319bcbdea3a1da86938"
    ]
};

const testPublicInputs = [
    "0x00000000000000000000000000000000392a2d1a05288b172f205541a56fc20d",
    "0x00000000000000000000000000000000000000000000000000000000c2c30e79",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x00000000000000000000000000000000392a2d1a05288b172f205541a56fc20d",
    "0x00000000000000000000000000000000000000000000000000000000c2c30e79",
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000000000000000000000000000"
];

// Test functions
function testProofHashGeneration() {
    console.log('🧪 Testing proof hash generation...');
    
    try {
        const proofHash = computeStandaloneProofHash(testProofData);
        console.log('✅ Proof hash generated:', proofHash);
        console.log('   Length:', proofHash.length, '(should be 66)');
        
        // Test that same input produces same hash
        const proofHash2 = computeStandaloneProofHash(testProofData);
        if (proofHash === proofHash2) {
            console.log('✅ Deterministic hash generation confirmed');
        } else {
            console.log('❌ Hash generation is not deterministic!');
        }
    } catch (error) {
        console.log('❌ Proof hash generation failed:', error.message);
    }
}

function testSingleUserAddition() {
    console.log('\n🧪 Testing single user addition...');
    
    try {
        const generator = new AirdropEligibilityGenerator();
        
        generator.addUser({
            walletAddress: "0x15759359e60a3b9e59eA7A96D10Fa48829f83bEb",
            snsId: "0xabcdef",
            amount: "100000000000000000000000000000",
            isStaking: false,
            proofFile: testProofData,
            preprocessFile: testPreprocessData,
            publicInputsFile: testPublicInputs
        });
        
        const stats = generator.getStats();
        console.log('✅ User added successfully');
        console.log('   Stats:', stats);
        
    } catch (error) {
        console.log('❌ Single user addition failed:', error.message);
    }
}

function testMultipleUsers() {
    console.log('\n🧪 Testing multiple users...');
    
    try {
        const generator = new AirdropEligibilityGenerator();
        
        const users = [
            {
                walletAddress: "0x15759359e60a3b9e59eA7A96D10Fa48829f83bEb",
                snsId: "0xabcdef",
                amount: "100000000000000000000000000000",
                isStaking: false,
                proofFile: testProofData,
                preprocessFile: testPreprocessData,
                publicInputsFile: testPublicInputs
            },
            {
                walletAddress: "0x742d35Cc6635C0532925a3b8D87c5B1c9f4b8E2A",
                snsId: "0x123456",
                amount: "50000000000000000000000000000",
                isStaking: true,
                proofFile: testProofData,
                preprocessFile: testPreprocessData,
                publicInputsFile: testPublicInputs
            },
            {
                walletAddress: "0x8ba1f109551bD432803012645Hac136c4100c7e5C",
                snsId: "0x789abc",
                amount: "75000000000000000000000000000",
                isStaking: false,
                proofFile: testProofData,
                preprocessFile: testPreprocessData,
                publicInputsFile: testPublicInputs
            }
        ];
        
        const results = generator.addMultipleUsers(users);
        console.log('✅ Multiple users processed');
        console.log('   Results:', results);
        
        const stats = generator.getStats();
        console.log('   Final stats:', stats);
        
    } catch (error) {
        console.log('❌ Multiple users test failed:', error.message);
    }
}

function testJSONGeneration() {
    console.log('\n🧪 Testing JSON generation...');
    
    try {
        const generator = new AirdropEligibilityGenerator();
        
        // Add a test user
        generator.addUser({
            walletAddress: "0x15759359e60a3b9e59eA7A96D10Fa48829f83bEb",
            snsId: "0xabcdef",
            amount: "100000000000000000000000000000",
            isStaking: false,
            proofFile: testProofData,
            preprocessFile: testPreprocessData,
            publicInputsFile: testPublicInputs
        });
        
        // Test JSON export
        const jsonString = generator.exportJSON();
        const parsed = JSON.parse(jsonString);
        
        console.log('✅ JSON generated successfully');
        console.log('   JSON structure keys:', Object.keys(parsed));
        console.log('   User count:', parsed.user.length);
        
        // Test file save
        generator.saveToFile('test_output.json');
        console.log('✅ JSON file saved as test_output.json');
        
    } catch (error) {
        console.log('❌ JSON generation failed:', error.message);
    }
}

function testErrorHandling() {
    console.log('\n🧪 Testing error handling...');
    
    const generator = new AirdropEligibilityGenerator();
    
    // Test invalid wallet address
    try {
        generator.addUser({
            walletAddress: "invalid_address",
            snsId: "0xabcdef",
            amount: "100000000000000000000000000000",
            isStaking: false,
            proofFile: testProofData,
            preprocessFile: testPreprocessData,
            publicInputsFile: testPublicInputs
        });
        console.log('❌ Should have failed with invalid wallet address');
    } catch (error) {
        console.log('✅ Invalid wallet address correctly rejected:', error.message);
    }
    
    // Test missing proof file
    try {
        generator.addUser({
            walletAddress: "0x15759359e60a3b9e59eA7A96D10Fa48829f83bEb",
            snsId: "0xabcdef",
            amount: "100000000000000000000000000000",
            isStaking: false,
            proofFile: null,
            preprocessFile: testPreprocessData,
            publicInputsFile: testPublicInputs
        });
        console.log('❌ Should have failed with missing proof file');
    } catch (error) {
        console.log('✅ Missing proof file correctly rejected:', error.message);
    }
}

function testFileOperations() {
    console.log('\n🧪 Testing file operations...');
    
    const fs = require('fs');
    
    try {
        // Create test files
        fs.writeFileSync('test_proof.json', JSON.stringify(testProofData, null, 2));
        fs.writeFileSync('test_preprocess.json', JSON.stringify(testPreprocessData, null, 2));
        fs.writeFileSync('test_public_inputs.json', JSON.stringify(testPublicInputs, null, 2));
        
        console.log('✅ Test files created');
        
        const generator = new AirdropEligibilityGenerator();
        
        // Test file path input
        generator.addUser({
            walletAddress: "0x15759359e60a3b9e59eA7A96D10Fa48829f83bEb",
            snsId: "0xabcdef",
            amount: "100000000000000000000000000000",
            isStaking: false,
            proofFile: 'test_proof.json',
            preprocessFile: 'test_preprocess.json',
            publicInputsFile: 'test_public_inputs.json'
        });
        
        console.log('✅ File path input works correctly');
        
        // Clean up test files
        fs.unlinkSync('test_proof.json');
        fs.unlinkSync('test_preprocess.json');
        fs.unlinkSync('test_public_inputs.json');
        
        console.log('✅ Test files cleaned up');
        
    } catch (error) {
        console.log('❌ File operations test failed:', error.message);
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting Airdrop Script Tests\n');
    
    testProofHashGeneration();
    testSingleUserAddition();
    testMultipleUsers();
    testJSONGeneration();
    testErrorHandling();
    testFileOperations();
    
    console.log('\n✨ All tests completed!');
    console.log('\n📋 Check the generated test_output.json file to see the final result.');
}

// Export for use as module or run directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    testProofHashGeneration,
    testSingleUserAddition,
    testMultipleUsers,
    testJSONGeneration,
    testErrorHandling,
    testFileOperations
};