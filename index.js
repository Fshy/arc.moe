const express = require('express');
const express = require('request');
const app     = express();

app.use(express.static('public'));

function badge(options, req, res) {
    // Format for URL
    left = options.left.replace("-", "--").replace("_", "__");
    right = options.right.replace("-", "--").replace("_", "__");
    // If no custom color is there, use Discord's blurple
    var color = req.query.color || "7289DA";
    // icon will be an identifier, let's convert it into a data URL
    var icon = req.query.icon || "";
    switch (icon) {
        case "1": // No border, just the controller part
            icon = assets.iconWhiteShadow;
            break;
        // No default - If there's no match, assume it's a Base64 string to be used as a custom icon
    }
    // Construct
    var url = `https://img.shields.io/badge/${left}-${right}-${color}.svg`;
    let paramsPart = "?";
    // If an icon is there, use it
    if (icon) paramsPart += "logo="+icon+"&";
    // If there's a style set, pass that along as well
    paramsPart = paramsPart.replace(/\&$/, "");
    if (paramsPart === "?") paramsPart = "";
    url += paramsPart;

    request(url, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            res.set("Content-Type", "image/svg+xml");
            res.send(body);
        }
    });
}

// Get total online users from a Discord server
function getOnlineUsers(serverId, callback) {
    request(`https://discordapp.com/api/servers/${serverId}/widget.json`, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            body = JSON.parse(body);
            let onlineCount = body.members.length;
            callback(null, onlineCount);
        } else {
            callback(new Error(response.statusCode));
        }
    });
}

///////////////////////////////
//////// Server badges ////////
///////////////////////////////

// Generic "chat on Discord"
app.get("/badge/discord", (req, res) => {
    badge({
        left: "chat",
        right: "on Discord"
    }, req, res);
});

// "Discord server" on the left, online users on the right
app.get("/badge/discord/online/:serverId", (req, res) => {
    let serverId = req.params.serverId; // The server ID to get members from

    getOnlineUsers(serverId, (err, amount) => {
        if (err) {
            // Error means the person doesn't have widgets enabled for their server, fallback to generic
            res.redirect("/badge/discord");
        } else {
            // Otherwise, send a badge with the data requested
            badge({
                left: "Discord server",
                right: `${amount} online`
            }, req, res);
        }
    });
});

// Custom title on the left, online users on the right
app.get("/badge/discord/online/:serverId/:displayName", (req, res) => {
    let serverId = req.params.serverId; // The server ID to get members from
    let displayName = req.params.displayName; // What to show on the right side

    getOnlineUsers(serverId, (err, amount) => {
        if (err) {
            // Error means the person doesn't have widgets enabled for their server, fallback to generic
            badge({
                left: "chat",
                right: "on Discord"
            }, req, res);
        } else {
            // Otherwise, send a badge with the data requested
            badge({
                left: displayName,
                right: `${amount} online`
            }, req, res);
        }
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
