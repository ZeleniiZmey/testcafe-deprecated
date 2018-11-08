/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

const fs = require('fs');
const path = require('path');

const dirname = path.dirname(__dirname);

// default values for config
const config = {
  fileName: 'report.html',
  outputPath: '../../',
};

if (process.env.NODE_ENV === 'test') {
  config.outputPath = './';
}

// add values for config from config file tcr-html.config.js
if (fs.existsSync(`${dirname}/../../tcr-html.config.js`)) {
  const newConfig = require(`${dirname}/../../tcr-html.config.js`);
  config.fileName = newConfig.fileName ? newConfig.fileName : config.fileName;
  config.outputPath = newConfig.outputPath ? newConfig.outputPath : config.outputPath;
}

function defaultFunction() {
  return {
    noColors: true,
    startTime: null,
    afterErrList: false,
    uaList: null,
    report: '',
    table: '',
    tableReports: '',
    testCount: 0,
    testRunId: 1,
    skipped: 0,

    reportTaskStart(startTime, userAgents, testCount) {
      this.startTime = startTime;
      this.uaList = userAgents.join(', ');
      this.testCount = testCount;
    },

    reportFixtureStart(name) {
      this.currentFixtureName = name;
    },

    reportTestDone(name, testRunInfo) {
      const testID = `test-${this.testRunId}`;
      this.testRunId += 1;
      const hasErr = !!testRunInfo.errs.length;
      const result = hasErr ? 'failed' : 'passed';
      if (testRunInfo.skipped) { this.skipped += 1; }

      this.compileTestTable(testID, name, testRunInfo, hasErr, result);
      if (hasErr) { this.compileErrors(name, testRunInfo, testID); }
    },

    compileErrors(name, testRunInfo, testID) {
      const heading = `${this.currentFixtureName} - ${name}`;

      this.report += this.indentString(`<h4 id="${testID}">${heading}</h4>\n`);
      testRunInfo.errs.forEach((error) => {
        this.report += this.indentString('<pre>');
        this.report += this.formatError(error, '');
        this.report += this.indentString('</pre>');
      });
    },

    compileTestTable(testID, name, testRunInfo, hasErr, result) {
      const lastIndex = `${testRunInfo.screenshotPath}`.lastIndexOf('/');
      const firstIndex = `${testRunInfo.screenshotPath}`.indexOf('/');
      const updateScreenshotPath = `${testRunInfo.screenshotPath}`.slice(firstIndex + 1, lastIndex);
      const screenshotPathPattern = `${updateScreenshotPath}/${this.currentFixtureName}/${name}`;

      if (hasErr) {
        this.tableReports += this.indentString('<tr class="danger">\n');
      } else if (testRunInfo.skipped) {
        this.tableReports += this.indentString('<tr class="warning">\n');
      } else {
        this.tableReports += this.indentString('<tr class="success">\n');
      }

      // TestID
      if (result === 'failed' || testRunInfo.skipped) {
        this.tableReports += this.indentString('<td>', 2);
        if (result === 'failed') {
          this.tableReports += this.indentString(`<a href="#${testID}">`, 4);
          this.tableReports += testID;
          this.tableReports += '</a>\n';
        }
        this.tableReports += '</td>\n';
        // Fixture
        this.tableReports += this.indentString('<td>', 2);
        this.tableReports += this.currentFixtureName;
        this.tableReports += '</td>\n';
        // Test
        this.tableReports += this.indentString('<td>', 2);
        this.tableReports += name;
        this.tableReports += '</td>\n';
        // Duration
        this.tableReports += this.indentString('<td>', 2);
        this.tableReports += this.moment.duration(testRunInfo.durationMs).format('h[h] mm[m] ss[s]');
        this.tableReports += '</td>\n';
        // Result
        this.tableReports += this.indentString('<td>', 2);
        if (testRunInfo.skipped) {
          this.tableReports += 'skipped';
        } else if (result === 'failed') {
          testRunInfo.errs.forEach((error) => {
            this.tableReports += this.indentString('<div style="width:400px;overflow:auto">');
            this.tableReports += this.indentString('<pre>');
            this.tableReports += this.formatError(error, '');
            this.tableReports += this.indentString('</pre>');
            this.tableReports += this.indentString('</div>');
          });
        }
        this.tableReports += '</td>\n';
        // Screenshot
        this.tableReports += this.indentString('<td>', 2);
        if (result === 'failed') {
          this.tableReports += this.indentString(`<a href="${screenshotPathPattern}/${testID}.png">`, 4);
          this.tableReports += this.indentString('screenshot', 6);
          this.tableReports += this.indentString('</a>\n');
        } else {
          this.tableReports += 'no screenshot';
        }
        this.tableReports += '</td>\n';

        this.tableReports += this.indentString('</tr>\n');
      }
    },

    reportTaskDone(endTime, passed/* , warnings */) {
      const durationMs = endTime - this.startTime;
      const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      const failed = this.testCount - passed;

      // Opening html
      let html = '<html lang="en">';
      html += '<head>';
      html += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">';
      html += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">';
      html += '</head>';
      html += '<body>';
      html += '<div class="container">';

      // Now add a summary
      html += '<h1 class="text-primary">TestCafe Test Summary</h1>';
      html += '<br>';
      html += '<div class="client-logo" style="padding:15px"></div>';
      html += '<div class="bg-primary" style="padding:15px">';
      html += '<h3>Summary</h3><br>';
      html += `<p class="lead">Start Time: ${this.startTime}</p>`;
      html += `<p class="lead">Browsers: ${this.uaList}</p>`;
      html += `<p class="lead">Duration: ${durationStr}</p>`;
      html += `<p class="lead">Tests Passed: ${passed}</p>`;
      html += `<p class="lead">Tests Failed: ${failed}</p>`;
      html += `<p class="lead">Tests Skipped: ${this.skipped}</p>`;
      html += '</div><br>';

      // Summary table
      html += '<table class="table" border=1 frame=hsides rules=rows width=80%>';
      html += '<tr>';
      html += '<th width=5%>Test ID</th>';
      html += '<th width=20%>Fixture</th>';
      html += '<th width=20%>Test Name</th>';
      html += '<th width=5%>Duration</th>';
      html += '<th width=40%>Result</th>';
      html += '<th width=10%>Screenshot</th>';
      html += '</tr>';
      html += this.tableReports;
      html += '</table>';
      html += '<br><br>';

      // Error details
      html += '<h3>Error Details</h3><br>';
      html += this.report;

      // closing html
      html += '</div></body></html>';

      this.write(html);

      try {
        fs.writeFileSync(`${config.outputPath}/${config.fileName}`, html);
      } catch (e) {
        console.log('Cannot write file ', e);
      }
    },
  };
}

module.exports = defaultFunction;
