import getGitDiff from './gitDiff';
import CoverageReport from './corevageReport';
import getArgumentsInstance from './arguments/ArgumentsFactory';

async function main() {
  const args = getArgumentsInstance();
  const diff = await getGitDiff();
  const report = new CoverageReport(`${args.GitRepoPath}/${args.CoverageReportPath}`);

  const fileResults = diff.ModifiedLines.map(file => ({
    fileName: file.fileName,
    lines: file.newLines.reduce((lines, { number, content }) => {
      if (report.isLineShouldBeCovered(file.fileName, number + 1)) {
        return [...lines, {
          number: number + 1,
          covered: report.isLineCovered(file.fileName, number + 1),
          content,
        }];
      }

      return lines;
    }, []),
  }));

  let coveredLinesCount = 0;
  let addedLinesCount = 0;

  fileResults.forEach(({ lines }) => {
    addedLinesCount += lines.length;
    coveredLinesCount += lines.filter(({ covered }) => covered).length;
  });

  const overallCoverage = addedLinesCount ? (coveredLinesCount / addedLinesCount) * 100 : 0;

  console.log(`Overall coverage: ${overallCoverage.toFixed(2)}%\n`);

  fileResults.forEach((file) => {
    const coveredFileLinesCount = file.lines.filter(line => line.covered).length;
    const coverage = file.lines.length ? 100 * coveredFileLinesCount / file.lines.length : 0;

    console.log(`File: ${file.fileName}`);
    console.log(`Coverage: ${coverage.toFixed(2)}%`);

    if (file.lines.length) {
      console.log('Details:');
    }

    file.lines.forEach(({ number, covered, content }) => {
      console.log(`${covered ? 'covered' : 'non-covered'} ${number} ${content.replace(/\+\s*/, '')}`);
    });
    console.log();
  });
}

main();
