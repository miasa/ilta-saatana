
const settings = {
  beforeChars : ['"', '”', '?', '!'],
  appendStr   : 'saatana',
  delimiter   : ' ',
  sites       : [
    {
      url       : 'https://www.iltalehti.fi',
      selectors : '.front-title, .article-headline, .article-list .title',
      target    : '#news-container'
    },
    {
      url       : 'https://www.is.fi',
      selectors : 'aside .list-item-title, main article h1, main article a h2, main article a h3, main .heading-section-1',
      target    : '#__next'
    },
    { 
      url       : 'https://www.hs.fi',
      selectors : 'aside .list-item-title, main article h1, main article a h2, main article a h3, main .heading-section-1',
      target    : '#__next'
    }
  ]
};

function addSatan(el) {
  // Detect cases like: <p>blabla <span>bla</span></p>
  let tempChildren;
  if(el.children) {
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
    // Add once for server rendered content
    document.querySelectorAll(site.selectors).forEach(el => addSatan(el));

    // Observe when child nodes are added
    if(site.target) {
      const targetNode = document.querySelector(site.target);
      const config = { attributes: false, childList: true, subtree: true };

      const callback = function(mutationsList, observer) {
        for(let mutation of mutationsList) {
          if(mutation.type === 'childList' && mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
              if(node.nodeType === 1) {
                node.querySelectorAll(site.selectors).forEach(el => addSatan(el));
              }
            });
          }
        }
      };

      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);

      //observer.disconnect();
    }
  });
