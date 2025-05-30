// scripts/failed-tests-reporter.js
import { writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Custom Vitest reporter that only saves failed tests to JSON
 */
export default class FailedTestsReporter {
  onFinished(files = [], errors = []) {
    const failedTests = [];

    files.forEach(file => {
      if (file.result?.state === 'fail') {
        const failedSuite = {
          name: file.name,
          startTime: file.result.startTime,
          endTime: file.result.endTime,
          status: 'failed',
          message: file.result.message || '',
          assertionResults: [],
        };

        // Extract failed test cases
        const extractFailedTests = tasks => {
          tasks.forEach(task => {
            if (task.type === 'test' && task.result?.state === 'fail') {
              failedSuite.assertionResults.push({
                ancestorTitles: this.getAncestorTitles(task),
                fullName: this.getFullTestName(task),
                status: 'failed',
                title: task.name,
                duration: task.result.duration,
                failureMessages: task.result.errors
                  ? task.result.errors.map(e => e.message || e.toString())
                  : [],
                meta: {},
              });
            }

            // Recursively check nested suites
            if (task.tasks) {
              extractFailedTests(task.tasks);
            }
          });
        };

        if (file.tasks) {
          extractFailedTests(file.tasks);
        }

        // Only add suite if it has failed tests
        if (failedSuite.assertionResults.length > 0) {
          failedTests.push(failedSuite);
        }
      }
    });

    // Generate summary
    const summary = {
      numTotalTestSuites: files.length,
      numFailedTestSuites: failedTests.length,
      numFailedTests: failedTests.reduce(
        (acc, suite) => acc + suite.assertionResults.length,
        0
      ),
      startTime: Date.now(),
      success: failedTests.length === 0,
      testResults: failedTests,
    };

    // Save to file
    const outputPath = resolve(process.cwd(), 'failed-tests.json');
    writeFileSync(outputPath, JSON.stringify(summary, null, 2));

    if (failedTests.length > 0) {
      console.log(`\n📋 Failed tests saved to: ${outputPath}`);
      console.log(
        `❌ ${summary.numFailedTests} failed tests in ${summary.numFailedTestSuites} suites`
      );
    } else {
      console.log(`\n✅ All tests passed! No failed tests to report.`);
    }
  }

  getAncestorTitles(task) {
    const titles = [];
    let current = task.suite;

    while (current && current.name) {
      titles.unshift(current.name);
      current = current.suite;
    }

    return titles;
  }

  getFullTestName(task) {
    const ancestors = this.getAncestorTitles(task);
    return [...ancestors, task.name].join(' ');
  }
}
