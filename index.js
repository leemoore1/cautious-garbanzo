var fs = require("fs");
var Papa = require("papaparse");
// TODO: use Octokit lib?

const commitsUrl = "https://api.github.com/repositories/19438/commits";
const file1 = "part1.csv";
const file2 = "part2.csv";
const file3 = "part3.csv";

const main = async () => {
  // Remove existing files.
  removeFiles();

  try {
    // TODO: Auth with token to prevent rate limiting?
    await fetch(commitsUrl).then((response) => {
      // Return if we're being rate limited by the GitHub API.
      if (response.status !== 200) {
        console.error(
          `Fetch returned status: ${response.status}, rate limit hit?`
        );
        return;
      }

      try {
        response.json().then((data) => {
          // Task #1: Write commit author details to CSV
          generateAuthorsCsvFile(data);

          // Task #2: Get unique committers and write first 5 followers to CSV
          generateFollowersCsvFile(data);

          // Task #3: For each commit, write repo URL, URL of last comment, URL of second to last comment
          generateCommentsCsvFile(data);
        });
      } catch (error) {
        console.error("Failed to parse commits as JSON");
      }
    });
  } catch (error) {
    console.error("Failed to fetch commits");
  }
};

const removeFiles = () => {
  console.log("Clean up files...");
  [file1, file2, file3].forEach((file) => {
    try {
      fs.rmSync(file, { force: true });
    } catch (error) {
      console.error(error);
    }
  });
};

const writeToFile = (filePath, data) => {
  fs.appendFile(filePath, data, (err) => {
    if (err) throw err;
  });
};

const generateAuthorsCsvFile = (data) => {
  const authors = data.map((d) => {
    return d.author;
  });

  let csv;

  try {
    // Parse the JavaScript objects into CSV
    csv = Papa.unparse(authors);
  } catch (error) {
    console.error("Failed to parse authors");
  }

  writeToFile(file1, csv);
};

const generateFollowersCsvFile = (data) => {
  const committers = data.map((d) => {
    return d.committer.login;
  });

  const unique = Array.from(new Set(committers));
  unique.forEach(async (u) => {
    await fetch(`https://api.github.com/users/${u}/followers`).then(
      (response) => {
        try {
          response.json().then((data) => {
            const firstFive = Array.from(data).slice(0, 5);
            const csv = Papa.unparse(firstFive);
            writeToFile(file2, csv);
          });
        } catch (error) {
          throw error;
        }
      }
    );
  });
};

const generateCommentsCsvFile = (data) => {
  const comments = data.map((d) => {
    return d.comments_url;
  });

  comments.forEach(async (c) => {
    await fetch(c).then((response) => {
      try {
        response.json().then((data) => {
          // TODO: Mocked API response?
          if (data.length < 2) {
            throw new Error("Less than 2 comments for this commit.");
          }

          // Reverse sort
          const sorted = Array.from(data).reverse();
          const lastTwo = sorted.slice(0, 2);
          const repoUrl = lastTwo[0].html_url.replace(
            new RegExp(/\/commits\/*/i)
          );
          const newObj = [
            {
              repoUrl,
              ...lastTwo[0].url,
              ...lastTwo[1].url,
            },
          ];

          const csv = Papa.unparse(newObj);
          writeToFile(file3, csv);
        });
      } catch (error) {
        throw error;
      }
    });
  });
};

main();
