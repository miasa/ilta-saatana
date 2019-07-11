
const settings = {
  beforeChars : ['"', '”', '?', '!'],
  appendStr   : 'saatana',
  delimiter   : ' ',
  sites       : [
    {
      url       : 'https://www.iltalehti.fi',
      selectors : '.article-title span, .article-headline, .article-list .title',
    },
    {
      url       : 'https://www.is.fi',
      selectors : '.teaser-links h3, .article-title, .is-most-read-articles-list .content p, .is-most-recent-articles-list .content, .extra-teaser h3, .is-most-commented-articles-list .content, .is-list .listitem-title',
      ignoreChildren : '.teaser-heading h2' //svg fit text thingamajig
    },
    { 
      url       : 'https://www.hs.fi',
      selectors : '.teaser-heading h2, .articlepack-title div:first-child, .is-most-read-articles-list .content p, .is-most-recent-articles-list .content, #page-article-content'
    }
  ]
};

function addSatan(el, params = {ignoreChildren: false}) {

  // Detect cases like: <p>blabla <span>bla</span></p>
  let tempChildren;
  if(el.children && params && params.ignoreChildren === false) {
    // Has child nodes other than text nodes, stash them temporarily
    tempChildren = Array.from(el.children).map(child => child.cloneNode(true));
    // Remove original children
    Array.from(el.children).forEach(child => el.removeChild(child));
  }

  const currentText = el.textContent.trim();
  const lastWord = currentText.split(/\s+/).pop();
  const lastCharIndex = currentText.length - 1;

  // Try to match case
  const appendStr = (lastWord === lastWord.toUpperCase()) ? settings.appendStr.toUpperCase() : settings.appendStr;

  // Detect chars and prepend
  let prepended = false;
  let newText = currentText;
  settings.beforeChars.forEach(char => {
    if(currentText.charAt(lastCharIndex) === char) {
      newText = currentText.substring(0, lastCharIndex) + settings.delimiter + appendStr + char + settings.delimiter;
      prepended = true;
    }
  });
  
  // Append
  if(!prepended) {
    newText += settings.delimiter + appendStr;
  }

  el.textContent = newText;

  // If had children, append them back
  if(Array.isArray(tempChildren)) {
    el.append(settings.delimiter, ...tempChildren);
  }
}

settings.sites
  .filter(site => window.location.href.includes(site.url))
  .forEach(site => {
    Array.from(document.querySelectorAll(site.selectors)).forEach(el => addSatan(el));
    Array.from(document.querySelectorAll(site.ignoreChildren)).forEach(el => addSatan(el, {ignoreChildren: true}));
  });
