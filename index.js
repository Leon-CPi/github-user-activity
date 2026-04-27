#!/usr/bin/env node

const events = {
    PushEvent: "commits pushed to",
    PullRequestEvent: "Requested PR in",
    IssuesEvent: "Opened an issue in",
    WatchEvent: "Starred",
    ForkEvent: "Forked",
    CreateEvent: "Created repo",
    GollumEvent: "Gollumed at repo"

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
    
    if (Object.keys(commits).length === 0) return false;

    return commits;
}

function handleLogging(data, commits) {
    console.log(data);
    for (let obj of data) {
        if (!(obj["type"] === "PushEvent")) console.log(`${events[obj["type"]]} ${obj["repo"]}`);

    }
    
    if (!Object.keys(commits).length) return;

    for (let commit of Object.keys(commits)) {
        console.log(`${commits[commit]} ${events["PushEvent"]} ${commit}`);
    }

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

    handleLogging(info, commits);
}).catch((err) => {
    console.error(err);
});