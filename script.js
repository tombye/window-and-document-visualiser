/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

class Store {
  constructor () {
    const namespace = 'visualiser';

    const defaults = {
      topOffset: 10,
      leftOffset: 10,
      scrollPosition: 0,
      windowHeight: 940,
      windowWidth: 1990,
      documentHeight: 2000,
      documentWidth: 1990,
      elementHeight: 400,
      elementWidth: 500,
      elementOffsetTop: 500,
      elementLeftPosition: 100
    };

    Object.keys(defaults).forEach(prop => {
      Object.defineProperty(this, prop, {
        enumerable: true,
        get: function () {
          return parseInt(sessionStorage.getItem(`${namespace}.${prop}`), 10);
        },
        set: function (value) {
          sessionStorage.setItem(`${namespace}.${prop}`, parseInt(value, 10));
          return true;
        }
      });

      if (sessionStorage.getItem(`${namespace}.${prop}`) === null) {
        this[prop] = defaults[prop];
      }
    });

    this.topOffset = sessionStorage.getItem(`${namespace}.topOffset`) || 10;
    this.leftOffset = sessionStorage.getItem(`${namespace}.leftOffset`) || 10;
    this.scrollPosition = sessionStorage.getItem(`${namespace}.scrollPosition`) || 0;
  }
}

const store = new Store();

// SVG shapes that make up the diagram
const canvas = document.querySelector('.diagram svg');
const windowShape = document.getElementById('window');
const documentShape = document.getElementById('document');
const elementShape = document.getElementById('element');
const strokeWidth = 5;

class Fields {
  constructor () {
    [
      'scrollPosition',
      'windowHeight',
      'windowWidth',
      'documentHeight',
      'documentWidth',
      'elementHeight',
      'elementWidth',
      'elementOffsetTop',
      'elementLeftPosition',
      'visibleHeight'
    ].forEach(prop => this[prop] = document.getElementById(prop));
  }
}

const fields = new Fields();

function updateFromStore () {
  Object.keys(store).forEach(key => {
    if (store[key] !== undefined) {
      if (key in fields) {
        const field = fields[key];

        if (field.hasAttribute('value')) {
          field.setAttribute('value', store[key]);
        }
        else if (field.textContent) {
          field.textContent = store[key];
        }
      }
    }
  });
};

function updateScrollPosition () {
  windowShape.setAttribute('y', store.topOffset + scale(store.scrollPosition));
};

function getWindowXPosition () {
  return store.leftOffset - strokeWidth / 2;
};

function getDocumentXPosition (windowXPosition) {
  return windowXPosition + scale((store.windowWidth / 2) - (store.documentWidth / 2));
};

function getElementXPosition (documentXPosition) {
  return documentXPosition + scale(store.elementLeftPosition);
};

// get the amount dimensions/positions need to be scaled by to fit on the canvas
function getScalingFactor () {
  const padding = parseInt(store.leftOffset, 10) * 2;
  const canvasWidth = parseInt(canvas.getAttribute('width'), 10);
  const canvasHeight = parseInt(canvas.getAttribute('height'), 10);
  const availableWidth = canvasWidth - (padding + strokeWidth);
  const availableHeight = canvasHeight - (padding + strokeWidth);

  const scaleByWidth = Math.ceil(store.windowWidth / availableWidth);
  const scaleByHeight = Math.ceil(store.windowHeight/ availableHeight);

  return (scaleByHeight > scaleByWidth) ? scaleByHeight : scaleByWidth;

};

function scale (value) {
  const scalingFactor = getScalingFactor();
  
  return value / scalingFactor;
};

function updateShapes () {
  store.windowHeight = parseInt(fields.windowHeight.value.trim(), 10);
  store.windowWidth = parseInt(fields.windowWidth.value.trim(), 10);
  store.documentHeight = parseInt(fields.documentHeight.value.trim(), 10);
  store.documentWidth = parseInt(fields.documentWidth.value.trim(), 10);
  store.elementHeight = parseInt(fields.elementHeight.value.trim(), 10);
  store.elementWidth = parseInt(fields.elementWidth.value.trim(), 10);
  store.elementOffsetTop = parseInt(fields.elementOffsetTop.value.trim(), 10);
  store.elementLeftPosition = parseInt(fields.elementLeftPosition.value.trim(), 10);
    
  const windowXPosition = getWindowXPosition();
  const documentXPosition = getDocumentXPosition(windowXPosition);
  const elementXPosition = getElementXPosition(documentXPosition);
  
  windowShape.setAttribute('height', scale(store.windowHeight));
  windowShape.setAttribute('width', scale(store.windowWidth));
  windowShape.setAttribute('y', store.topOffset + scale(store.scrollPosition));
  windowShape.setAttribute('x', windowXPosition);
  documentShape.setAttribute('height', scale(store.documentHeight));
  documentShape.setAttribute('width', scale(store.documentWidth));
  documentShape.setAttribute('y', store.topOffset);
  documentShape.setAttribute('x', documentXPosition);
  elementShape.setAttribute('height', scale(store.elementHeight));
  elementShape.setAttribute('width', scale(store.elementWidth));
  elementShape.setAttribute('y', store.topOffset + scale(store.elementOffsetTop));
  elementShape.setAttribute('x', elementXPosition);
  
  updateVisibleHeight();
};

function getVisibleHeight () {
  const windowBottom = store.scrollPosition + store.windowHeight;
  const elementOffsetTop = store.elementOffsetTop;
  const scrollPosition = store.scrollPosition;
  const elementHeight = store.elementHeight;
  const elementBottom = elementOffsetTop + store.elementHeight;
  let visibleHeight;
  
  // if element fits in window
  if ((scrollPosition <= elementOffsetTop) && (windowBottom >= elementBottom)) {
    visibleHeight = elementHeight;
  } else {
    if (scrollPosition > elementOffsetTop) { // if top of window is past top of element
      visibleHeight = elementHeight - (scrollPosition - elementOffsetTop);    
    } else {
      visibleHeight = windowBottom - elementOffsetTop;
    }
  }
  
  return visibleHeight;
};

function updateVisibleHeight () {
  const visibleHeight = getVisibleHeight();
  
  fields.visibleHeight.textContent = (visibleHeight < 0) ? 0 : visibleHeight;
};

function onScrollPositionInput (e) {
  const scrollPosition = parseInt(fields.scrollPosition.value.trim(), 10);
  
  if (scrollPosition < 0) {
    fields.scrollPosition.value = 0;
  }
  
  store.scrollPosition = scrollPosition;
  updateScrollPosition();
  updateVisibleHeight();
};

fields.scrollPosition.addEventListener('input', onScrollPositionInput, false);
document.querySelector('dl').addEventListener('input', updateShapes, false);
updateFromStore();
updateShapes();
updateVisibleHeight();

