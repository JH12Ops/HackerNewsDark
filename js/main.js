async function injectCSS() {
    let css = await getCss();
    let a = document.createElement('a');
    let inner = `s.innerHTML=\`${css}\``;

    a.setAttribute('style', 'display: none !important;');
    a.setAttribute('onclick', `(function() { let s = document.createElement('style');s.setAttribute('data-isl', 'injected-style');${inner};document.querySelector('head').appendChild(s); })();`);

    document.querySelector('head').appendChild(a);

    a.click();
    a.remove();
}

async function getCss() {
    const url = chrome.runtime.getURL('css/style.css');
    const response = await fetch(url);
    return await response.text();
}

function main() {
    const bodyClasses = document.body.classList;
    const location = document.location.href;

    bodyClasses.add("home-page");

    if (location.indexOf('reply') > -1) {
        bodyClasses.add("post-page")
        bodyClasses.remove("home-page");
    }

    if (location.indexOf('newcomments') > -1) {
        bodyClasses.add("comment-page")
        bodyClasses.remove("home-page");
    }

    if (location.indexOf('threads') > -1) {
        bodyClasses.add("threads-page")
        bodyClasses.remove("home-page");
    }

    if (location.indexOf('ask') > -1) {
        bodyClasses.add("ask-page")
        bodyClasses.remove("home-page");
    }

    if (location.indexOf('jobs') > -1) {
        bodyClasses.add("jobs-page")
        bodyClasses.remove("home-page");
    }

// set loaded class so we know when to fade in content
    bodyClasses.add("page-loaded")

// create link to active
    const activeLink = document.createElement("a");
    activeLink.setAttribute("href", "active");
    activeLink.text = "Active"

    const hnname = document.querySelector(".hnname")
    hnname.after(activeLink)

//Hide default nav bar
    document.querySelector("#hnmain > tbody:nth-child(1) > tr:nth-child(1)").hidden = true;

    const loggedIn = document.querySelector("#me");

    const logoutUrl = loggedIn
        ? document.querySelector("#logout").attributes.href.value
        : "";

    const htmlHeader = `
<div class="headerContainer">
    <div class="headerBar hnbar">
      <div class="titleItem orange">
        <a href="news">Hacker News</a>
      </div>
      <div class="titleItem activePosts">
        <a href="active">Active</a>
      </div>
      <div class="titleItem newPosts">
        <a href="newest">New</a>
      </div>
      <div class="titleItem pastPosts">
        <a href="front">Past</a>
      </div>
      <div class="titleItem ">
        <a href="newcomments">Comments</a>
      </div>
      <div class="titleItem">
        <a href="ask">Ask</a>
      </div>
      <div class="titleItem">
        <a href="show">Show</a>
      </div>
      <div class="titleItem">
        <a href="jobs">Jobs</a>
      </div>
      <div class="titleItem">
        <a href="submit">Submit</a>
      </div>
      ${loggedIn ? `
        <div class="titleItem">
          <a href=${loggedIn.attributes.href.value}>${loggedIn.outerText}</a>
        </div>
        <div class="titleItem">
          <a href=${logoutUrl}>Logout</a>
        </div>`
        :`<div class="titleItem">
          <a href="login?goto=news">Login</a>
        </div>`}
    </div>
</div>`

    const borderColors = [
        "DeepSkyBlue",
        "Lime",
        "Fuchsia",
        "Gold",
        "Crimson",
        "MediumVioletRed",
        "OrangeRed",
        "Indigo"
    ]

    if (document.querySelector(".hnbar") == null) {

        const newHeader = new DOMParser().parseFromString(htmlHeader, "text/html").body.children[0];
        document.querySelector("body > center:nth-child(1)").firstChild.before(newHeader)

        if (document.documentURI.endsWith("news")) {
            document.querySelectorAll("body > center > table > tbody > tr:nth-child(n + 2) > td > table tr:nth-child(3n + 2) td")
                .forEach(i => i.classList.add("hnHomepage"))
        }

        else if (document.documentURI.includes("item")) {
            document.querySelectorAll("td[indent]")
                .forEach(i => {
                    const indent = Number(i.attributes["indent"].value);
                    if (indent != null) {
                        i.parentElement.style.marginBottom = "1rem"
                        i.style.borderRight = `5px solid ${borderColors[indent % borderColors.length]}`;
                    }
                });
        }
    }

    if (location.indexOf('item') > -1) {
        handlePostPage(bodyClasses);
    }
}

function handlePostPage(bodyClasses) {
    bodyClasses.add("post-page")
    bodyClasses.remove("home-page");

    const newOpLink = document.querySelector(".subtext a[href^='user?']");
    const newOps = document.querySelector(`a[href='${newOpLink.attributes.href.value}'`)

    newOps.classList.add("op")
    newOps.text = `${newOpLink.text} [OP]`

    affixPostInfo();
}

function affixPostInfo() {
    const postDetailsTable = document.querySelector(".fatitem");
    const upVoteLink = postDetailsTable.querySelector(".votelinks a").href;
    const titleDetails = postDetailsTable.querySelector(".titleline > a");
    const title = titleDetails.textContent;
    const titleUrl = titleDetails.href;
    const sublineDetails = postDetailsTable.querySelector(".subline");
    const points = sublineDetails.querySelector(".score").textContent;
    const postAuthorDetails = sublineDetails.querySelector(".op");
    const postAuthorName = postAuthorDetails.textContent.split(" ")[0];
    const postAuthorUrl = postAuthorDetails.href;
    const postDateString = sublineDetails.querySelector(".age").title;
    const postDate = Number.parseInt(postDateString.split(" ")[1]) * 1000;
    const correctDate = new Date(postDate);
    const dateDiffToNowHours = Math.round((new Date() - correctDate) / 3_600_000);
    const age = dateDiffToNowHours > 12 ? correctDate.toDateString() : `${dateDiffToNowHours} hours ago`;
    const links = sublineDetails.querySelectorAll("a");
    const linksDict = {};

    if (links.length >= 3) {
        linksDict["hide"] = links[2]
    }

    if (links.length >= 4) {
        linksDict["past"] = links[3]
    }

    if (links.length >= 5) {
        linksDict["fav"] = links[4];
    }

    if (links.length >= 6) {
        linksDict["commentsCount"] = links[5].textContent;
    }

    const htmlString = `
    <div class="postTitleContainer">
        <div class="mainPostTitle">
            <span>${title}</span>
            <span>(
            <a href="${titleUrl}"><span class="smallText orangeText">${titleDetails.host}</span></a>
            )</span>
        </div>
        <div class="postTitle">
            <button class="upvotePost"><a href="${upVoteLink}"><div class="votearrow" title="upvote"></div></a></button>
            <span>
                <span class="yellowText">${points} by</span>
                <span class="orangeText">
                    <a href="${postAuthorUrl}">
                        <span>${postAuthorName}</span>
                    </a>
                </span>
            </span>    
            <span class="greyText">${age}</span>
            <span>
                ${linksDict["hide"] != null ? `<span class="whiteText">| <a href="${linksDict["hide"]}">hide</a></span>` : null}
                ${linksDict["past"] != null ? `<span class="whiteText">| <a href="${linksDict["past"]}">past</a></span>` : null}
                ${linksDict["fav"] != null ? `<span class="whiteText">| <a href="${linksDict["fav"]}">favorite</a> |</span>` : null}
            </span>
            ${linksDict["commentsCount"] != null ? `<span class="greyText">${linksDict["commentsCount"]}</span>` : null}
        </div>
    </div>
    `

    postDetailsTable.parentNode.removeChild(postDetailsTable);

    const postTitleElement = new DOMParser().parseFromString(htmlString, "text/html").body.children[0];
    document.querySelector(".headerContainer").lastChild.after(postTitleElement);
}

injectCSS().then(() => {main()});
