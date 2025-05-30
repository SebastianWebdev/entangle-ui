// scripts/generate-badges.js
const fs = require('fs');

/**
 * Generates dynamic badges for README based on test results and coverage
 */
function generateBadges() {
  try {
    const badgesData = JSON.parse(
      fs.readFileSync('test_results/badges.json', 'utf8')
    );

    console.log('🏷️  Generating dynamic badges...\n');

    // Generate shields.io URLs
    const shieldsUrls = Object.entries(badgesData).map(([key, badge]) => {
      const url = `https://img.shields.io/badge/${badge.label}-${encodeURIComponent(badge.message)}-${badge.color}`;
      console.log(`${badge.label}: ${url}`);
      return { key, url, ...badge };
    });

    // Generate badge markdown
    const badgeMarkdown = shieldsUrls
      .map(badge => `![${badge.label}](${badge.url})`)
      .join(' ');

    // Generate badge HTML (for more control)
    const badgeHtml = shieldsUrls
      .map(badge => `<img src="${badge.url}" alt="${badge.label}" />`)
      .join(' ');

    // Save different formats
    const output = {
      urls: shieldsUrls,
      markdown: badgeMarkdown,
      html: badgeHtml,
      individual: shieldsUrls.reduce((acc, badge) => {
        acc[badge.key] = {
          markdown: `![${badge.label}](${badge.url})`,
          html: `<img src="${badge.url}" alt="${badge.label}" />`,
          url: badge.url,
        };
        return acc;
      }, {}),
    };

    fs.writeFileSync(
      'test_results/badges-output.json',
      JSON.stringify(output, null, 2)
    );
    fs.writeFileSync('test_results/badges.md', badgeMarkdown);
    fs.writeFileSync('test_results/badges.html', badgeHtml);

    console.log('\n📁 Generated Badge Files:');
    console.log('   • test_results/badges-output.json - All badge formats');
    console.log('   • test_results/badges.md - Markdown badges');
    console.log('   • test_results/badges.html - HTML badges');

    console.log('\n📋 Copy this to your README:');
    console.log('```markdown');
    console.log(badgeMarkdown);
    console.log('```');
  } catch (error) {
    console.error('❌ Error generating badges:', error.message);
    console.log(
      '💡 Run npm run test:package-report first to generate badge data'
    );
  }
}

generateBadges();
