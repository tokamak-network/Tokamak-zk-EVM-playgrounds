const crypto = require('crypto');
const { ethers } = require('ethers');

class AirdropEligibilityGenerator {
    constructor() {
        this.eligibilityData = {
            user: [],
            snsId: [],
            amountGranted: [],
            stake: [],
            proofHash: [],
            preprocess_entries_part1: [],
            preprocess_entries_part2: [],
            proof_entries_part1: [],
            proof_entries_part2: [],
            public_inputs: []
        };
    }

    /**
     * Add a user to the airdrop eligibility list
     * @param {Object} userData - User data object
     * @param {string} userData.walletAddress - User's wallet address
     * @param {string} userData.snsId - SnsId
     * @param {string} userData.amount - Amount to be granted (in wei)
     * @param {boolean} userData.isStaking - Whether user is staking
     * @param {Object|string} userData.proofFile - User's uploaded proof JSON (object or file path)
     * @param {Object|string} userData.preprocessFile - User's uploaded preprocess JSON (object or file path)
     * @param {Object|string|Array} userData.publicInputsFile - User's uploaded public inputs JSON (object, file path, or array)
     */
    addUser(userData) {
        // Validate wallet address
        if (!ethers.isAddress(userData.walletAddress)) {
            throw new Error('Invalid wallet address');
        }

        // Validate and parse proof file
        const proofData = this.parseProofFile(userData.proofFile);
        if (!proofData) {
            throw new Error('Invalid or missing proof file');
        }

        // Validate and parse preprocess file
        const preprocessData = this.parsePreprocessFile(userData.preprocessFile);
        if (!preprocessData) {
            throw new Error('Invalid or missing preprocess file');
        }

        // Validate and parse public inputs file
        const publicInputsData = this.parsePublicInputsFile(userData.publicInputsFile);
        if (!publicInputsData) {
            throw new Error('Invalid or missing public inputs file');
        }

        // Add basic user data
        this.eligibilityData.user.push(userData.walletAddress);
        this.eligibilityData.snsId.push(userData.snsId || this.generateRandomHex(6));
        this.eligibilityData.amountGranted.push(userData.amount || "0");
        this.eligibilityData.stake.push(userData.isStaking ? "true" : "false");

        // Compute proof hash from proof data only
        const proofHash = this.computeProofHash(userData, proofData, preprocessData);
        this.eligibilityData.proofHash.push(proofHash);

        // Add user's preprocess entries directly
        this.eligibilityData.preprocess_entries_part1.push(...preprocessData.preprocess_entries_part1);
        this.eligibilityData.preprocess_entries_part2.push(...preprocessData.preprocess_entries_part2);

        // Add user's proof entries directly
        this.eligibilityData.proof_entries_part1.push(...proofData.proof_entries_part1);
        this.eligibilityData.proof_entries_part2.push(...proofData.proof_entries_part2);

        // Add user's public inputs directly
        this.eligibilityData.public_inputs.push(...publicInputsData);
    }

    /**
     * Parse and validate user's uploaded proof file
     * @param {Object|string} proofFile - Proof JSON object or file path
     * @returns {Object} Parsed proof data
     */
    parseProofFile(proofFile) {
        let proofData;

        try {
            if (typeof proofFile === 'string') {
                // If it's a file path, read the file
                const fs = require('fs');
                const fileContent = fs.readFileSync(proofFile, 'utf8');
                proofData = JSON.parse(fileContent);
            } else if (typeof proofFile === 'object') {
                // If it's already an object, use it directly
                proofData = proofFile;
            } else {
                throw new Error('Proof file must be a file path or JSON object');
            }

            // Validate proof structure
            if (!proofData.proof_entries_part1 || !Array.isArray(proofData.proof_entries_part1)) {
                throw new Error('Missing or invalid proof_entries_part1');
            }
            if (!proofData.proof_entries_part2 || !Array.isArray(proofData.proof_entries_part2)) {
                throw new Error('Missing or invalid proof_entries_part2');
            }

            // Validate proof entries format
            this.validateProofEntries(proofData.proof_entries_part1, 'part1');
            this.validateProofEntries(proofData.proof_entries_part2, 'part2');

            return proofData;
        } catch (error) {
            console.error('Error parsing proof file:', error.message);
            return null;
        }
    }

    /**
     * Validate proof entries format
     * @param {Array} entries - Array of proof entries
     * @param {string} part - Part identifier ('part1' or 'part2')
     */
    validateProofEntries(entries, part) {
        entries.forEach((entry, index) => {
            if (typeof entry !== 'string' || !entry.startsWith('0x')) {
                throw new Error(`Invalid proof entry format at ${part}[${index}]: ${entry}`);
            }
            
            // Part1 should be 32 hex characters (16 bytes), Part2 should be 64 hex characters (32 bytes)
            const expectedLength = part === 'part1' ? 34 : 66; // 0x + hex characters
            if (entry.length !== expectedLength) {
                throw new Error(`Invalid proof entry length at ${part}[${index}]: expected ${expectedLength}, got ${entry.length}`);
            }
        });
    }

    /**
     * Parse and validate user's uploaded preprocess file
     * @param {Object|string} preprocessFile - Preprocess JSON object or file path
     * @returns {Object} Parsed preprocess data
     */
    parsePreprocessFile(preprocessFile) {
        let preprocessData;

        try {
            if (typeof preprocessFile === 'string') {
                // If it's a file path, read the file
                const fs = require('fs');
                const fileContent = fs.readFileSync(preprocessFile, 'utf8');
                preprocessData = JSON.parse(fileContent);
            } else if (typeof preprocessFile === 'object') {
                // If it's already an object, use it directly
                preprocessData = preprocessFile;
            } else {
                throw new Error('Preprocess file must be a file path or JSON object');
            }

            // Validate preprocess structure
            if (!preprocessData.preprocess_entries_part1 || !Array.isArray(preprocessData.preprocess_entries_part1)) {
                throw new Error('Missing or invalid preprocess_entries_part1');
            }
            if (!preprocessData.preprocess_entries_part2 || !Array.isArray(preprocessData.preprocess_entries_part2)) {
                throw new Error('Missing or invalid preprocess_entries_part2');
            }

            // Validate preprocess entries format
            this.validatePreprocessEntries(preprocessData.preprocess_entries_part1, 'part1');
            this.validatePreprocessEntries(preprocessData.preprocess_entries_part2, 'part2');

            return preprocessData;
        } catch (error) {
            console.error('Error parsing preprocess file:', error.message);
            return null;
        }
    }

    /**
     * Validate preprocess entries format
     * @param {Array} entries - Array of preprocess entries
     * @param {string} part - Part identifier ('part1' or 'part2')
     */
    validatePreprocessEntries(entries, part) {
        entries.forEach((entry, index) => {
            if (typeof entry !== 'string' || !entry.startsWith('0x')) {
                throw new Error(`Invalid preprocess entry format at ${part}[${index}]: ${entry}`);
            }
            
            // Part1 should be 32 hex characters (16 bytes), Part2 should be 64 hex characters (32 bytes)
            const expectedLength = part === 'part1' ? 34 : 66; // 0x + hex characters
            if (entry.length !== expectedLength) {
                throw new Error(`Invalid preprocess entry length at ${part}[${index}]: expected ${expectedLength}, got ${entry.length}`);
            }
        });
    }

    /**
     * Compute proof hash from proof data only
     * This is the main computation function for generating proof hashes
     */
    computeProofHash(userData, proofData, preprocessData) {
        // Only hash the proof components
        const proofHashInput = {
            proof_entries_part1: proofData.proof_entries_part1,
            proof_entries_part2: proofData.proof_entries_part2
        };

        // Convert to deterministic string and hash
        const dataString = JSON.stringify(proofHashInput, Object.keys(proofHashInput).sort());
        return '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
    }

    /**
     * Static method to compute proof hash independently
     * Only hashes the proof data, not user info or preprocess data
     */
    static computeProofHashStatic(proofData) {
        const proofHashInput = {
            proof_entries_part1: proofData.proof_entries_part1,
            proof_entries_part2: proofData.proof_entries_part2
        };

        const dataString = JSON.stringify(proofHashInput, Object.keys(proofHashInput).sort());
        return '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
    }

    /**
     * Generate preprocessing entries for zero-knowledge proof
     */
    generatePreprocessEntries() {
        const part1 = [];
        const part2 = [];

        // Generate 4 entries for part1 (16 bytes each)
        for (let i = 0; i < 4; i++) {
            part1.push('0x' + crypto.randomBytes(16).toString('hex'));
        }

        // Generate 4 entries for part2 (32 bytes each)
        for (let i = 0; i < 4; i++) {
            part2.push('0x' + crypto.randomBytes(32).toString('hex'));
        }

        return { part1, part2 };
    }

    /**
     * Generate proof entries from provided proof data
     */
    generateProofEntries(proofData = null) {
        const part1 = [];
        const part2 = [];

        // If no proof data provided, generate random entries
        if (!proofData) {
            // Generate random proof entries part1 (16 bytes each)
            for (let i = 0; i < 38; i++) {
                part1.push('0x' + crypto.randomBytes(16).toString('hex'));
            }

            // Generate random proof entries part2 (32 bytes each)
            for (let i = 0; i < 42; i++) {
                part2.push('0x' + crypto.randomBytes(32).toString('hex'));
            }
        } else {
            // Use provided proof data
            part1.push(...(proofData.part1 || []));
            part2.push(...(proofData.part2 || []));
        }

        return { part1, part2 };
    }

    /**
     * Parse and validate user's uploaded public inputs file
     * @param {Object|string|Array} publicInputsFile - Public inputs JSON object, file path, or array
     * @returns {Array} Parsed public inputs data
     */
    parsePublicInputsFile(publicInputsFile) {
        let publicInputsData;

        try {
            if (typeof publicInputsFile === 'string') {
                // If it's a file path, read the file
                const fs = require('fs');
                const fileContent = fs.readFileSync(publicInputsFile, 'utf8');
                const parsedContent = JSON.parse(fileContent);
                
                // Handle different possible structures
                if (Array.isArray(parsedContent)) {
                    publicInputsData = parsedContent;
                } else if (parsedContent.public_inputs && Array.isArray(parsedContent.public_inputs)) {
                    publicInputsData = parsedContent.public_inputs;
                } else {
                    throw new Error('Public inputs file must contain an array or have a public_inputs property');
                }
            } else if (Array.isArray(publicInputsFile)) {
                // If it's already an array, use it directly
                publicInputsData = publicInputsFile;
            } else if (typeof publicInputsFile === 'object' && publicInputsFile.public_inputs) {
                // If it's an object with public_inputs property
                publicInputsData = publicInputsFile.public_inputs;
            } else {
                throw new Error('Public inputs must be an array, file path, or object with public_inputs property');
            }

            // Validate public inputs format
            this.validatePublicInputs(publicInputsData);

            return publicInputsData;
        } catch (error) {
            console.error('Error parsing public inputs file:', error.message);
            return null;
        }
    }

    /**
     * Validate public inputs format
     * @param {Array} inputs - Array of public inputs
     */
    validatePublicInputs(inputs) {
        if (!Array.isArray(inputs)) {
            throw new Error('Public inputs must be an array');
        }

        inputs.forEach((input, index) => {
            if (typeof input !== 'string' || !input.startsWith('0x')) {
                throw new Error(`Invalid public input format at index ${index}: ${input}`);
            }
            
            // Public inputs should be 64 hex characters (32 bytes) + 0x prefix = 66 characters
            if (input.length !== 66) {
                throw new Error(`Invalid public input length at index ${index}: expected 66, got ${input.length}`);
            }
        });
    }

    /**
     * Generate random hex string
     */
    generateRandomHex(bytes) {
        return '0x' + crypto.randomBytes(bytes).toString('hex');
    }

    /**
     * Validate user eligibility based on custom criteria
     */
    validateUserEligibility(userData) {
        const criteria = {
            hasValidWallet: ethers.isAddress(userData.walletAddress),
            hasMinimumAmount: userData.amount && BigInt(userData.amount) > 0,
            hasValidSns: userData.snsId && userData.snsId.length > 0,
            hasValidProof: userData.proofFile !== null && userData.proofFile !== undefined,
            hasValidPreprocess: userData.preprocessFile !== null && userData.preprocessFile !== undefined,
            hasValidPublicInputs: userData.publicInputsFile !== null && userData.publicInputsFile !== undefined,
            // Add more criteria as needed
        };

        return Object.values(criteria).every(Boolean);
    }

    /**
     * Batch add multiple users
     */
    addMultipleUsers(userDataArray) {
        const results = {
            successful: 0,
            failed: 0,
            errors: []
        };

        userDataArray.forEach((userData, index) => {
            try {
                if (this.validateUserEligibility(userData)) {
                    this.addUser(userData);
                    results.successful++;
                } else {
                    results.failed++;
                    results.errors.push(`User ${index}: Failed eligibility validation`);
                }
            } catch (error) {
                results.failed++;
                results.errors.push(`User ${index}: ${error.message}`);
            }
        });

        return results;
    }

    /**
     * Export the generated eligibility data as JSON
     */
    exportJSON() {
        return JSON.stringify(this.eligibilityData, null, 4);
    }

    /**
     * Save eligibility data to file
     */
    saveToFile(filename = 'airdrop_eligibility.json') {
        const fs = require('fs');
        fs.writeFileSync(filename, this.exportJSON());
        console.log(`Eligibility data saved to ${filename}`);
    }

    /**
     * Reset all data
     */
    reset() {
        this.eligibilityData = {
            user: [],
            snsId: [],
            amountGranted: [],
            stake: [],
            proofHash: [],
            preprocess_entries_part1: [],
            preprocess_entries_part2: [],
            proof_entries_part1: [],
            proof_entries_part2: [],
            public_inputs: []
        };
    }

    /**
     * Helper method to process uploaded proof files from a directory
     * @param {string} proofDirectory - Directory containing user proof files
     * @param {Array} userDataArray - Array of user data (without proof files)
     * @returns {Object} Processing results
     */
    processProofDirectory(proofDirectory, userDataArray) {
        const fs = require('fs');
        const path = require('path');
        
        const results = {
            successful: 0,
            failed: 0,
            errors: []
        };

        try {
            const proofFiles = fs.readdirSync(proofDirectory).filter(file => file.endsWith('.json'));
            
            userDataArray.forEach((userData, index) => {
                try {
                    // Look for proof file matching user's wallet address or index
                    const expectedFileName = `${userData.walletAddress}.json` || `proof_${index}.json`;
                    const proofFilePath = path.join(proofDirectory, expectedFileName);
                    
                    if (fs.existsSync(proofFilePath)) {
                        userData.proofFile = proofFilePath;
                        
                        if (this.validateUserEligibility(userData)) {
                            this.addUser(userData);
                            results.successful++;
                        } else {
                            results.failed++;
                            results.errors.push(`User ${index}: Failed eligibility validation`);
                        }
                    } else {
                        results.failed++;
                        results.errors.push(`User ${index}: Proof file not found at ${proofFilePath}`);
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push(`User ${index}: ${error.message}`);
                }
            });
        } catch (error) {
            results.errors.push(`Directory processing error: ${error.message}`);
        }

        return results;
    }
}

// Example usage
function exampleUsage() {
    const generator = new AirdropEligibilityGenerator();

    // Example proof data (what user would upload)
    const userProofData = {
        "proof_entries_part1": [
            "0x0c24fdec12d53a11da4d980c17d4e1a0",
            "0x17a05805dfe64737462cc7905747825b",
            "0x0896a633d5adf4b47c13d51806d66a35",
            // ... more entries
        ],
        "proof_entries_part2": [
            "0x29afb6b437675cf15e0324fe3bad032c88bd9addc36ff22855acb73a5c3f4cef",
            "0xdd670e5cdb1a14f5842e418357b752ee2200d5eab40a3990615224f2467c985a",
            "0xa379b716417a5870cc2f334e28cd91a388c5e3f18012f24700a103ea0c2aacb2",
            // ... more entries
        ]
    };

    // Example preprocess data (what user would upload)
    const userPreprocessData = {
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

    // Example public inputs data (what user would upload)
    const userPublicInputsData = [
        "0x00000000000000000000000000000000392a2d1a05288b172f205541a56fc20d",
        "0x00000000000000000000000000000000000000000000000000000000c2c30e79",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        // ... more entries (typically 128 entries total)
    ];

    // Add individual user with uploaded proof, preprocess, and public inputs data
    generator.addUser({
        walletAddress: "0x15759359e60a3b9e59eA7A96D10Fa48829f83bEb",
        snsId: "0xabcdef",
        amount: "100000000000000000000000000000", // Amount in wei
        isStaking: false,
        proofFile: userProofData, // User's uploaded proof
        preprocessFile: userPreprocessData, // User's uploaded preprocess data
        publicInputsFile: userPublicInputsData // User's uploaded public inputs
    });

    // Example of computing proof hash independently (only from proof data)
    const computedHash = AirdropEligibilityGenerator.computeProofHashStatic(userProofData);
    console.log('Computed proof hash:', computedHash);

    // Add multiple users with their files
    const users = [
        {
            walletAddress: "0x742d35Cc6635C0532925a3b8D87c5B1c9f4b8E2A",
            snsId: "0x123456",
            amount: "50000000000000000000000000000",
            isStaking: true,
            proofFile: userProofData,
            preprocessFile: userPreprocessData,
            publicInputsFile: userPublicInputsData
        },
        {
            walletAddress: "0x8ba1f109551bD432803012645Hac136c4100c7e5C",
            snsId: "0x789abc",
            amount: "75000000000000000000000000000",
            isStaking: false,
            proofFile: userProofData,
            preprocessFile: userPreprocessData,
            publicInputsFile: userPublicInputsData
        }
    ];

    const results = generator.addMultipleUsers(users);
    console.log('Batch processing results:', results);

    // Get statistics
    console.log('Current stats:', generator.getStats());

    // Export JSON
    const jsonData = generator.exportJSON();
    console.log('Generated JSON structure ready for airdrop');

    // Save to file
    generator.saveToFile('my_airdrop_eligibility.json');

    return jsonData;
}

// Standalone function to compute proof hash (can be used independently)
function computeStandaloneProofHash(proofData) {
    return AirdropEligibilityGenerator.computeProofHashStatic(proofData);
}

// Export the class and functions
module.exports = {
    AirdropEligibilityGenerator,
    exampleUsage,
    computeStandaloneProofHash
};

// If running this file directly, run the example
if (require.main === module) {
    exampleUsage();
}