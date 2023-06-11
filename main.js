let debug = false;

// Get URL Parameters (Credit to html-online.com)
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
function getUrlParam(parameter, defaultvalue) {
    var urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}

let channel = getUrlParam("channel", "gkey").toLowerCase();
let channel_id = 40295380;
console.log(channel);
window.emotes = [];

const init_7tv_eventsub = () => {
    const source = new EventSource(`https://events.7tv.app/v1/channel-emotes?&channel=${channel}`);

    source.addEventListener(
        "update",
        (e) => {
            // This is a JSON payload matching the type for the specified event channel
            const data = JSON.parse(e.data);

            if (data.action === "REMOVE") {
                console.log(`removing ${data.name}`)
                window.emotes = window.emotes.filter(e => e.emoteName !== data.name)
            }

            if (data.action === "ADD") {
                console.log(`adding ${data.name}`)
                window.emotes.push({
                    emoteName: data.emote.name,
                    emoteURL: data.emote.urls[1][1],
                })
            }
        },
        false
    );
}


async function getEmotes(check) {
    window.emotes = [];

    function returnResponse(response) {
        return response.json();
    }
    function logError(error) {
        console.log(error.message);
    }

    // const proxyurl = 'https://cors-anywhere.herokuapp.com/';
    // const proxyurl = "https://tpbcors.herokuapp.com/";
    const proxyurl = "";
    const user_agent = debug ? "http://127.0.0.1:5500/" : "https://g-showemote-fork.netlify.app";
    let twitchID;
    let totalErrors = [];

    // get channel twitch ID

    try {
        await fetch(proxyurl + "https://api.ivr.fi/twitch/resolve/" + channel, {
            method: "GET",
            headers: { "User-Agent": user_agent },
        }).then(returnResponse, logError);
        if (!res.error || res.status == 200) {
            twitchID = res.id;
        } else {
            totalErrors.push("Error getting twitch ID");
        }
    } catch {
        twitchID = 40295380;
    }

    // get FFZ emotes
    let res = await fetch(proxyurl + "https://api.frankerfacez.com/v1/room/" + channel, {
        method: "GET",
    }).then(returnResponse, logError);
    if (!res.error) {
        let setName = Object.keys(res.sets);
        for (var k = 0; k < setName.length; k++) {
            for (var i = 0; i < res.sets[setName[k]].emoticons.length; i++) {
                const emoteURL = res.sets[setName[k]].emoticons[i].urls["2"]
                    ? res.sets[setName[k]].emoticons[i].urls["2"]
                    : res.sets[setName[k]].emoticons[i].urls["1"];
                let emote = {
                    emoteName: res.sets[setName[k]].emoticons[i].name,
                    emoteURL: "https://" + emoteURL.split("//").pop(),
                };
                window.emotes.push(emote);
            }
        }
    } else {
        totalErrors.push("Error getting ffz emotes");
    }
    // get all global ffz emotes
    res = await fetch(proxyurl + "https://api.frankerfacez.com/v1/set/global", {
        method: "GET",
    }).then(returnResponse, logError);
    if (!res.error) {
        let setName = Object.keys(res.sets);
        for (var k = 0; k < setName.length; k++) {
            for (var i = 0; i < res.sets[setName[k]].emoticons.length; i++) {
                const emoteURL = res.sets[setName[k]].emoticons[i].urls["2"]
                    ? res.sets[setName[k]].emoticons[i].urls["2"]
                    : res.sets[setName[k]].emoticons[i].urls["1"];
                let emote = {
                    emoteName: res.sets[setName[k]].emoticons[i].name,
                    emoteURL: "https://" + emoteURL.split("//").pop(),
                };
                window.emotes.push(emote);
            }
        }
    } else {
        totalErrors.push("Error getting global ffz emotes");
    }
    // get all BTTV emotes
    res = await fetch(proxyurl + "https://api.betterttv.net/3/cached/users/twitch/" + twitchID, {
        method: "GET",
    }).then(returnResponse, logError);
    if (!res.message) {
        for (var i = 0; i < res.channelEmotes.length; i++) {
            let emote = {
                emoteName: res.channelEmotes[i].code,
                emoteURL: `https://cdn.betterttv.net/emote/${res.channelEmotes[i].id}/2x`,
            };
            window.emotes.push(emote);
        }
        for (var i = 0; i < res.sharedEmotes.length; i++) {
            let emote = {
                emoteName: res.sharedEmotes[i].code,
                emoteURL: `https://cdn.betterttv.net/emote/${res.sharedEmotes[i].id}/2x`,
            };
            window.emotes.push(emote);
        }
        console.log(window.emotes);
    } else {
        totalErrors.push("Error getting bttv emotes");
    }
    // global bttv emotes
    res = await fetch(proxyurl + "https://api.betterttv.net/3/cached/emotes/global", {
        method: "GET",
    }).then(returnResponse, logError);
    if (!res.message) {
        for (var i = 0; i < res.length; i++) {
            let emote = {
                emoteName: res[i].code,
                emoteURL: `https://cdn.betterttv.net/emote/${res[i].id}/2x`,
            };
            window.emotes.push(emote);
        }
        console.log(window.emotes);
    } else {
        totalErrors.push("Error getting global bttv emotes");
    }
    if (sevenTVEnabled == 1) {
        // get all 7TV emotes
        res = await fetch(proxyurl + `https://api.7tv.app/v3/users/twitch/${channel_id}`, {
            method: "GET",
        }).then(returnResponse, logError)
            .then((result) => {
                result = result.emote_set.emotes;

                for (var i = 0; i < result.length; i++) {
                    let emote = {
                        emoteName: result[i].name,
                        emoteURL: `https://cdn.7tv.app/emote/${result[i].id}/2x.webp`,
                    };
                    window.emotes.push(emote);
                }
            });
        // get all 7TV global emotes
        res = await fetch(proxyurl + `https://api.7tv.app/v2/emotes/global`, {
            method: "GET",
        }).then(returnResponse, logError);
        if (!res.error || res.status == 200) {
            if (res.Status === 404) {
                totalErrors.push("Error getting 7tv global emotes");
            } else {
                for (var i = 0; i < res.length; i++) {
                    let emote = {
                        emoteName: res[i].name,
                        emoteURL: res[i].urls[1][1],
                    };
                    window.emotes.push(emote);
                }
            }
        } else {
            totalErrors.push("Error getting 7tv global emotes");
        }
    }
    if (totalErrors.length > 0) {
        totalErrors.forEach((error) => {
            console.error(error);
        });
        $("#errors").html(totalErrors.join("<br />")).delay(5000).fadeOut(300);
    } else {
        $("#errors").html(`Successfully loaded ${window.emotes.length} emotes.`).delay(2000).fadeOut(300);
    }
}

let currentStreak = { streak: 1, emote: null, emoteURL: null }; // the current emote streak being used in chat
let currentEmote; // the current emote being used in chat
let showEmoteCooldownRef = new Date(); // the emote shown from using the !showemote <emote> command
let minStreak = getUrlParam("minStreak", 3) > 2 ? getUrlParam("minStreak", 3) : 3; // minimum emote streak to trigger overlay effects (Minimum value allowed is 3)
let streakEnabled = getUrlParam("streakEnabled", 1); // allows user to enable/disable the streak module
let showEmoteEnabled = getUrlParam("showEmoteEnabled", 1); // allows user to enable/disable the showEmote module
let showEmoteSizeMultiplier = getUrlParam("showEmoteSizeMultiplier", 1); // allows user to change the showEmote emote size multipler
let sevenTVEnabled = getUrlParam("7tv", 1); // enables or disables support for 7tv.app emotes (only loads in channel emotes, not global)
let showEmoteCooldown = getUrlParam("showEmoteCooldown", 6); // sets the cooldown for the showEmote command (in seconds)
let emoteStreakText = decodeURIComponent(getUrlParam("emoteStreakText", "streak!")); // sets the ending text for the emote streak overlay (set to empty string to disable)
let blocklisted_emotes = getUrlParam("blocklisted_emotes", "").split(",");
console.log(`The streak module is ${streakEnabled} and the showEmote module is ${showEmoteEnabled}`);
let streakCD = new Date().getTime();

function findEmotes(message, messageFull) {
    if (window.emotes.length !== 0) {
        let emoteUsedPos = messageFull[4].startsWith("emotes=") ? 4 : messageFull[5].startsWith("emote-only=") ? 6 : 5;
        let emoteUsed = messageFull[emoteUsedPos].split("emotes=").pop();
        messageSplit = message.split(" ");
        if (messageSplit.includes(currentStreak.emote)) {
            currentStreak.streak++;
        } // add to emote streak
        else if (messageFull[emoteUsedPos].startsWith("emotes=") && emoteUsed.length > 1) {
            // default twitch emotes
            currentStreak.streak = 1;
            currentStreak.emote = message.substring(parseInt(emoteUsed.split(":")[1].split("-")[0]), parseInt(emoteUsed.split(":")[1].split("-")[1]) + 1);
            currentStreak.emoteURL = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteUsed.split(":")[0]}/default/dark/2.0`;
        } else {
            // find bttv/ffz emotes
            currentStreak.streak = 1;
            currentStreak.emote = findEmoteInMessage(messageSplit);
            currentStreak.emoteURL = findEmoteURLInEmotes(currentStreak.emote);
        }

        function findEmoteInMessage(message) {
            for (const emote of window.emotes.map((a) => a.emoteName)) {
                if (message.includes(emote)) {
                    return emote;
                }
            }
            return null;
        }
        function findEmoteURLInEmotes(emote) {
            for (const emoteObj of window.emotes) {
                if (emoteObj.emoteName == emote) {
                    return emoteObj.emoteURL;
                }
            }
            return null;
        }
        streakEvent();
    }
}

function streakEvent() {
    if (currentStreak.streak >= minStreak && streakEnabled == 1) {
        $("#main").empty();
        $("#main").css("position", "absolute");
        $("#main").css("top", "600");
        $("#main").css("left", "35");
        var img = $("<img />", { src: currentStreak.emoteURL });
        img.appendTo("#main");
        var streakLength = $("#main").append(" 󠀀  󠀀  x" + currentStreak.streak + " " + emoteStreakText);
        streakLength.appendTo("#main");
        gsap.to("#main", 0.15, { scaleX: 1.2, scaleY: 1.2, onComplete: downscale });
        function downscale() {
            gsap.to("#main", 0.15, { scaleX: 1, scaleY: 1 });
        }
        streakCD = new Date().getTime();
        setInterval(() => {
            if ((new Date().getTime() - streakCD) / 1000 > 4) {
                streakCD = new Date().getTime();
                gsap.to("#main", 0.2, { scaleX: 0, scaleY: 0, delay: 0.5, onComplete: remove });
                function remove() {
                    streakCD = new Date().getTime();
                }
            }
        }, 1 * 1000);
    }
}

function showEmote(message, messageFull) {
    if (window.emotes.length !== 0 && showEmoteEnabled == 1) {
        let emoteUsedPos = messageFull[4].startsWith("emotes=") ? 4 : 5;
        let emoteUsedID = messageFull[emoteUsedPos].split("emotes=").pop();
        messageSplit = message.split(" ");
        if (emoteUsedID.length == 0) {
            let emoteUsed = findEmoteInMessage(messageSplit);
            let emoteLink = findEmoteURLInEmotes(emoteUsed);
            if (emoteLink) {
                return showEmoteEvent({ emoteName: emoteUsed, emoteURL: emoteLink });
            }
        } else {
            let emoteUsed = message.substring(parseInt(emoteUsedID.split(":")[1].split("-")[0]), parseInt(emoteUsedID.split(":")[1].split("-")[1]) + 1);
            let emoteLink = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteUsedID.split(":")[0]}/default/dark/2.0`;
            return showEmoteEvent({ emoteName: emoteUsed, emoteURL: emoteLink });
        }
        function findEmoteInMessage(message) {
            for (const emote of window.emotes.map((a) => a.emoteName)) {
                if (message.includes(emote)) {
                    return emote;
                }
            }
            return null;
        }
        function findEmoteURLInEmotes(emote) {
            for (const emoteObj of window.emotes) {
                if (emoteObj.emoteName == emote) {
                    return emoteObj.emoteURL;
                }
            }
            return null;
        }
    }
}

function showEmoteEvent(emote) {
    let secondsDiff = (new Date().getTime() - new Date(showEmoteCooldownRef).getTime()) / 1000;
    console.log(secondsDiff);
    if (secondsDiff > parseInt(showEmoteCooldown)) {
        showEmoteCooldownRef = new Date();
        var image = emote.emoteURL;
        var max_height = 720;
        var max_width = 1280;
        function getRandomCoords() {
            var r = [];
            var x = Math.floor(Math.random() * max_width);
            var y = Math.floor(Math.random() * max_height);

            r = [x, y];
            return r;
        }
        function createImage() {
            $("#showEmote").empty();
            var xy = getRandomCoords();
            $("#showEmote").css("position", "absolute");
            $("#showEmote").css("top", xy[1] + "px");
            $("#showEmote").css("left", xy[0] + "px");
            console.log("creating showEmote");
            // 1% chance of getting a big emote
            // if so, multiplier will be 3x-5x
            let _multiplier = showEmoteSizeMultiplier;
            if (Math.random() < 0.01) {
                let amount = 3 + Math.random() * 2;
                _multiplier = showEmoteSizeMultiplier * amount;
            }
            var img = $("<img />", { src: image, style: `transform: scale(${_multiplier}, ${_multiplier})` });
            img.appendTo("#showEmote");
            gsap.to("#showEmote", 1, { autoAlpha: 1, onComplete: anim2 });
            function anim2() {
                gsap.to("#showEmote", 1, { autoAlpha: 0, delay: 4, onComplete: remove });
            }
            function remove() {
                $("#showEmote").empty();
            }
        }
        createImage();
    }
}

// Connecting to twitch chat
function connect() {
    const chat = new WebSocket("wss://irc-ws.chat.twitch.tv");
    var timeout = setTimeout(function () {
        chat.close();
        chat.connect();
    }, 10 * 1000);

    chat.onopen = function () {
        clearInterval(timeout);
        chat.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
        chat.send("PASS oauth:xd123");
        chat.send("NICK justinfan123");
        chat.send("JOIN #" + channel);
        getEmotes();
    };

    chat.onerror = function () {
        console.log("There was an error.. disconnected from the IRC");
        chat.close();
        chat.connect();
    };

    chat.onmessage = function (event) {
        let messageFull = event.data.split(/\r\n/)[0].split(`;`);
        if (messageFull.length > 12) {
            let messageBefore = messageFull[messageFull.length - 1].split(`${channel} :`).pop(); // gets the raw message
            let message = messageBefore.split(" ").includes("ACTION") ? messageBefore.split("ACTION ").pop().split("")[0] : messageBefore; // checks for the /me ACTION usage and gets the specific message
            if ((
                messageFull[3].includes("aRandomFinn") ||
                messageFull[3].includes("pepega00000") ||
                messageFull[1].includes("broadcaster") ||
                messageFull[1].includes("vip") ||
                messageFull[1].includes("moderator")) && (message === "!r" || message === "!refreshoverlay")
            ) {
                getEmotes();
                console.log('Refreshing emotes...');
                return;
            }
            for (const e of blocklisted_emotes)
                if (message.split(" ").includes(e)) { console.log("blocked emote", e); return };
            if (message.toLowerCase().startsWith("!showemote") || message.toLowerCase().startsWith("!#showemote"))
                showEmote(message, messageFull);
            findEmotes(message, messageFull);
        }
        if (messageFull.length == 1 && messageFull[0].startsWith("PING")) {
            console.log("sending pong");
            chat.send("PONG");
        }
    };
}

init_7tv_eventsub();