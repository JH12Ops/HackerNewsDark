const bodyClasses = document.body.classList;
const location = document.location.href;

bodyClasses.add("home-page");

if (location.indexOf('item') > -1) {
  bodyClasses.add("post-page")
  bodyClasses.remove("home-page");

  const newOpLink = document.querySelector(".subtext a[href^='user?']");
  const newOps = document.querySelector(`a[href='${newOpLink.attributes.href.value}'`)

  newOps.classList.add("op")
  newOps.text = `${newOpLink.text} [OP]`

}
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


const hnname = document.querySelector('.hnname')
hnname.after(activeLink)

//Hide default nav bar
document.querySelector("#hnmain > tbody:nth-child(1) > tr:nth-child(1)").hidden = true;

const loggedIn = document.querySelector("#me");

const logoutUrl = loggedIn
    ? document.querySelector("#logout").attributes.href.value
    : "";


const htmlHeader = `
<div class="headerBar hnbar">
  <div class="titleItem">
    <a href="news">Hacker News</a>
  </div>
  <div>
    <a href="active">Active</a>
  </div>
  <div>
    <a href="new">New</a>
  </div>
  <div>
    <a href="past">Past</a>
  </div>
  <div>
    <a href="comments">Comments</a>
  </div>
  <div>
    <a href="ask">Ask</a>
  </div>
  <div>
    <a href="show">Show</a>
  </div>
  <div>
    <a href="jobs">Jobs</a>
  </div>
  <div>
    <a href="submit">Submit</a>
  </div>
  ${loggedIn ? `
    <div>
      <a href=${loggedIn.attributes.href.value}>${loggedIn.outerText}</a>
    </div>
    <div>
      <a href=${logoutUrl}>Logout</a>
    </div>`
    :`<div>
      <a href="login?goto=news">Login</a>
    </div>`}
</div>`

const borderColors = ["red", "green", "blue", "yellow", "purple"];

if(document.querySelector(".hnbar") == null) {

  const newHeader = new DOMParser().parseFromString(htmlHeader, "text/html").body.children[0];
  document.querySelector("body > center:nth-child(1)").firstChild.before(newHeader)


  if(document.documentURI.endsWith("news")) {
    document.querySelectorAll("body > center > table > tbody > tr:nth-child(n + 2) > td > table tr:nth-child(3n + 2) td")
        .forEach(i => i.classList.add("hnHomepage"))
  }

  else if(document.documentURI.includes("item")) {
    document.querySelectorAll("td[indent]")
        .forEach(i => {
          const indent = Number(i.attributes["indent"].value);
          if (indent != null) {
            i.parentElement.style.marginBottom = "1rem"
            i.style.borderRight = `3px solid ${borderColors[indent % borderColors.length]}`;
          }
        });
  }
}

