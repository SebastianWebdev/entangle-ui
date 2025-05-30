// scripts/generate-package-report.js
const fs = require('fs');
const path = require('path');

/**
 * Generates a comprehensive package quality report for npm packages
 * Combines test results, coverage, and package metrics
 */
function generatePackageReport() {
  try {
    console.log('📊 Generating comprehensive package report...\n');

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Read test results
    let testResults = null;
    let coverageResults = null;
    let coverageSummary = null;

    try {
      testResults = JSON.parse(
        fs.readFileSync('test_results/coverage-results.json', 'utf8')
      );
    } catch (e) {
      console.warn(
        '⚠️  No test results found. Run npm run test:coverage first.'
      );
    }

    try {
      coverageSummary = JSON.parse(
        fs.readFileSync('test_results/coverage/coverage-summary.json', 'utf8')
      );
    } catch (e) {
      console.warn('⚠️  No coverage summary found.');
    }

    // Calculate metrics
    const report = {
      package: {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        author: packageJson.author,
        license: packageJson.license,
        keywords: packageJson.keywords || [],
        dependencies: Object.keys(packageJson.dependencies || {}),
        peerDependencies: Object.keys(packageJson.peerDependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
      },
      testing: testResults
        ? {
            totalTests: testResults.numTotalTests || 0,
            passedTests: testResults.numPassedTests || 0,
            failedTests: testResults.numFailedTests || 0,
            passRate:
              testResults.numTotalTests > 0
                ? (
                    (testResults.numPassedTests / testResults.numTotalTests) *
                    100
                  ).toFixed(2) + '%'
                : '0%',
            totalSuites: testResults.numTotalTestSuites || 0,
            passedSuites: testResults.numPassedTestSuites || 0,
            status: testResults.success ? '✅ PASSING' : '❌ FAILING',
          }
        : null,
      coverage: coverageSummary
        ? {
            lines: {
              total: coverageSummary.total?.lines?.total || 0,
              covered: coverageSummary.total?.lines?.covered || 0,
              percentage: coverageSummary.total?.lines?.pct || 0,
            },
            functions: {
              total: coverageSummary.total?.functions?.total || 0,
              covered: coverageSummary.total?.functions?.covered || 0,
              percentage: coverageSummary.total?.functions?.pct || 0,
            },
            branches: {
              total: coverageSummary.total?.branches?.total || 0,
              covered: coverageSummary.total?.branches?.covered || 0,
              percentage: coverageSummary.total?.branches?.pct || 0,
            },
            statements: {
              total: coverageSummary.total?.statements?.total || 0,
              covered: coverageSummary.total?.statements?.covered || 0,
              percentage: coverageSummary.total?.statements?.pct || 0,
            },
          }
        : null,
      quality: {
        hasTests: testResults ? testResults.numTotalTests > 0 : false,
        hasCoverage: coverageSummary
          ? coverageSummary.total?.lines?.pct > 0
          : false,
        hasTypeScript: fs.existsSync('tsconfig.json'),
        hasLinting:
          fs.existsSync('eslint.config.js') || fs.existsSync('.eslintrc.js'),
        hasPrettier:
          fs.existsSync('prettier.config.js') || fs.existsSync('.prettierrc'),
        hasStorybook: fs.existsSync('.storybook'),
        hasContinuousIntegration:
          fs.existsSync('.github/workflows') || fs.existsSync('.gitlab-ci.yml'),
      },
      files: {
        sourceFiles: countFiles('src', ['.ts', '.tsx']),
        testFiles: countFiles('src', ['.test.ts', '.test.tsx']),
        storyFiles: countFiles('src', ['.stories.ts', '.stories.tsx']),
        totalSize: calculateDirectorySize('src'),
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'Editor UI Toolkit Test Suite',
    };

    // Generate badges data
    const badges = generateBadges(report);

    // Save full report
    fs.writeFileSync(
      'test_results/package-report.json',
      JSON.stringify(report, null, 2)
    );

    // Save badges data
    fs.writeFileSync(
      'test_results/badges.json',
      JSON.stringify(badges, null, 2)
    );

    // Generate README section
    const readmeSection = generateReadmeSection(report, badges);
    fs.writeFileSync('test_results/README-quality-section.md', readmeSection);

    // Print summary
    printReportSummary(report);

    console.log('\n📁 Generated Files:');
    console.log('   • test_results/package-report.json - Full package report');
    console.log('   • test_results/badges.json - Badge data for README');
    console.log(
      '   • test_results/README-quality-section.md - README quality section'
    );
    console.log('   • test_results/coverage/ - Detailed coverage reports');
  } catch (error) {
    console.error('❌ Error generating package report:', error.message);
    process.exit(1);
  }
}

function countFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return 0;

  let count = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      count += countFiles(path.join(dir, file.name), extensions);
    } else if (extensions.some(ext => file.name.endsWith(ext))) {
      count++;
    }
  }

  return count;
}

function calculateDirectorySize(dir) {
  if (!fs.existsSync(dir)) return 0;

  let size = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      size += calculateDirectorySize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }

  return Math.round(size / 1024); // Convert to KB
}

function generateBadges(report) {
  const badges = {};

  if (report.testing) {
    badges.tests = {
      label: 'tests',
      message: `${report.testing.passedTests}/${report.testing.totalTests} passing`,
      color: report.testing.failedTests === 0 ? 'brightgreen' : 'red',
    };
  }

  if (report.coverage) {
    const linesCoverage = report.coverage.lines.percentage;
    badges.coverage = {
      label: 'coverage',
      message: `${linesCoverage}%`,
      color:
        linesCoverage >= 90
          ? 'brightgreen'
          : linesCoverage >= 80
            ? 'yellow'
            : linesCoverage >= 70
              ? 'orange'
              : 'red',
    };
  }

  badges.typescript = {
    label: 'typescript',
    message: report.quality.hasTypeScript ? 'yes' : 'no',
    color: report.quality.hasTypeScript ? 'blue' : 'lightgrey',
  };

  return badges;
}

function generateReadmeSection(report, badges) {
  const badgeUrls = Object.entries(badges)
    .map(
      ([key, badge]) =>
        `![${badge.label}](https://img.shields.io/badge/${badge.label}-${encodeURIComponent(badge.message)}-${badge.color})`
    )
    .join(' ');

  return `## Code Quality

${badgeUrls}

### Test Coverage

${
  report.testing
    ? `
- **Tests**: ${report.testing.totalTests} total (${report.testing.passedTests} passing, ${report.testing.failedTests} failing)
- **Test Suites**: ${report.testing.totalSuites} total (${report.testing.passedSuites} passing)
- **Pass Rate**: ${report.testing.passRate}
`
    : '- No test data available'
}

${
  report.coverage
    ? `
### Coverage Metrics

| Metric | Coverage |
|--------|----------|
| Lines | ${report.coverage.lines.percentage}% (${report.coverage.lines.covered}/${report.coverage.lines.total}) |
| Functions | ${report.coverage.functions.percentage}% (${report.coverage.functions.covered}/${report.coverage.functions.total}) |
| Branches | ${report.coverage.branches.percentage}% (${report.coverage.branches.covered}/${report.coverage.branches.total}) |
| Statements | ${report.coverage.statements.percentage}% (${report.coverage.statements.covered}/${report.coverage.statements.total}) |
`
    : ''
}

### Quality Checklist

${Object.entries({
  TypeScript: report.quality.hasTypeScript,
  ESLint: report.quality.hasLinting,
  Prettier: report.quality.hasPrettier,
  Tests: report.quality.hasTests,
  Coverage: report.quality.hasCoverage,
  Storybook: report.quality.hasStorybook,
  'CI/CD': report.quality.hasContinuousIntegration,
})
  .map(([name, has]) => `- ${has ? '✅' : '❌'} ${name}`)
  .join('\n')}

### Package Stats

- **Source Files**: ${report.files.sourceFiles}
- **Test Files**: ${report.files.testFiles} 
- **Story Files**: ${report.files.storyFiles}
- **Total Size**: ${report.files.totalSize}KB
`;
}

function printReportSummary(report) {
  console.log('📦 PACKAGE QUALITY REPORT');
  console.log('========================\n');

  console.log(`📋 Package: ${report.package.name} v${report.package.version}`);
  console.log(`📝 Description: ${report.package.description}`);

  if (report.testing) {
    console.log(`\n🧪 Testing: ${report.testing.status}`);
    console.log(
      `   Tests: ${report.testing.passedTests}/${report.testing.totalTests} passing (${report.testing.passRate})`
    );
    console.log(
      `   Suites: ${report.testing.passedSuites}/${report.testing.totalSuites} passing`
    );
  }

  if (report.coverage) {
    console.log(`\n📊 Coverage:`);
    console.log(`   Lines: ${report.coverage.lines.percentage}%`);
    console.log(`   Functions: ${report.coverage.functions.percentage}%`);
    console.log(`   Branches: ${report.coverage.branches.percentage}%`);
  }

  console.log(`\n🔧 Quality:`);
  Object.entries(report.quality).forEach(([key, value]) => {
    const emoji = value ? '✅' : '❌';
    console.log(
      `   ${emoji} ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`
    );
  });
}

generatePackageReport();
