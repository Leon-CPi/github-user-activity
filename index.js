#!/usr/bin/env node

const events = {
    PushEvent: "commits",
    PullRequestEvent: "PR opened",
    IssuesEvent: "Issue opened",
    WatchEvent: "Starred repository",
    ForkEvent: "Forked"
}
/* Handle arguments */

const parsedArgs = process.argv.slice(2);
const name = parsedArgs[0];

/* Utils */

function collectInfo(data) {
    const mappedData = data.map((data) => {
        return {
            "type": data["type"],
            "repo": data["repo"]["name"],
            "name": data["actor"]["display_login"]

        }
    })

    return mappedData;
}

function countCommits(data) {
    const commits = {};

    for (let obj of data ) {
        if (!(obj.type ===  "PushEvent")) continue;

        if (commits[obj.repo]) commits[obj.repo] += 1;

        if (!commits[obj.repo]) commits[obj.repo] = 1;

    }
    
    return commits;
}

/* API Handle */

/* https://api.github.com/users/<username>/events */

const api_resolved = (name) => {
    const link = `https://api.github.com/users/${name}/events`

    return link;
}

const fetchData = async (api_link) => {
    try {
        const fetchedData = await fetch(api_link);

        if (!fetchedData) throw new Error(`Response status: ${fetchedData.status}`);

        const parsedData = await fetchedData.json();

        return parsedData;
    } catch(error) {
        console.error(error);
    }
} 


fetchData(api_resolved(name)).then((res, rej) => {
    const info = collectInfo(res);

    const commits = countCommits(info);

    console.log(commits);
}).catch((err) => {
    console.error(err);
});