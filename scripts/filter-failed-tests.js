// scripts/filter-failed-tests.js
const fs = require('fs');
const path = require('path');

/**
 * Filters a full test results JSON to only include failed tests
 * Usage: node scripts/filter-failed-tests.js [input-file] [output-file]
 */
function filterFailedTests() {
  const inputFile = process.argv[2] || 'test_results/test-results.json';
  const outputFile = process.argv[3] || 'test_results/failed-tests.json';
  
  try {
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ Input file not found: ${inputFile}`);
      process.exit(1);
    }

    const fullResults = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    // Filter to only failed test suites
    const failedSuites = fullResults.testResults.filter(suite => 
      suite.status === 'failed' || 
      (suite.assertionResults && suite.assertionResults.some(test => test.status === 'failed'))
    );
    
    // For each suite, filter to only failed tests
    const filteredSuites = failedSuites.map(suite => ({
      ...suite,
      status: 'failed',
      assertionResults: suite.assertionResults.filter(test => 
        test.status === 'failed'
      )
    })).filter(suite => suite.assertionResults.length > 0);
    
    const failedOnlyResults = {
      numTotalTestSuites: fullResults.numTotalTestSuites || 0,
      numPassedTestSuites: fullResults.numPassedTestSuites || 0,
      numFailedTestSuites: filteredSuites.length,
      numTotalTests: fullResults.numTotalTests || 0,
      numPassedTests: fullResults.numPassedTests || 0,
      numFailedTests: filteredSuites.reduce((acc, suite) => acc + suite.assertionResults.length, 0),
      startTime: fullResults.startTime,
      success: false,
      testResults: filteredSuites
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(failedOnlyResults, null, 2));
    
    console.log(`\n📋 Test Results Summary:`);
    console.log(`   Total Suites: ${failedOnlyResults.numTotalTestSuites}`);
    console.log(`   Failed Suites: ${failedOnlyResults.numFailedTestSuites}`);
    console.log(`   Failed Tests: ${failedOnlyResults.numFailedTests}`);
    console.log(`\n✅ Failed tests saved to: ${path.resolve(outputFile)}`);
    
    if (failedOnlyResults.numFailedTests === 0) {
      console.log(`\n🎉 No failed tests found!`);
    }
    
  } catch (error) {
    console.error('❌ Error filtering failed tests:', error.message);
    process.exit(1);
  }
}

filterFailedTests();